import { describe, expect, it } from "vitest";

import { IDEAS_SECTION_PAYLOAD_FIELD } from "./constants";
import {
  buildIdeasSectionsQuery,
  buildReviewSubmission,
  buildSectionFormData,
  buildUploadFieldKey,
  formatFileSize,
  isPending,
  mediaSummary,
  parseSortOption,
  toSectionDraft,
  toSectionPayload,
  truncate,
} from "./utils";
import { MediaPlatform, MediaType, MediaUploadType } from "@/store/slices/types";
import type { IdeasSectionDraft, IdeasSectionResponse } from "./types";

const section: IdeasSectionResponse = {
  id: "section-1",
  title: "Brincadeira dos balões",
  description: "Ideia para o clubinho de sábado",
  public: false,
  pageId: null,
  medias: [
    {
      id: "media-1",
      title: "Foto",
      description: null,
      uploadType: "upload",
      mediaType: "image",
      isLocalFile: true,
      url: "https://example.com/foto.jpg",
      platformType: null,
      originalName: "foto.jpg",
      size: 2048,
    },
  ],
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-02T10:00:00.000Z",
};

/**
 * Trava o formato do que sai daqui para a API.
 *
 * `CreateIdeasSectionDto` e `UpdateIdeasSectionDto` recusam propriedade
 * desconhecida, então um campo a mais derruba a requisição com 400.
 */
describe("ideas-sections utils", () => {
  it("a fila envia só o que QueryIdeasSectionsDto aceita", () => {
    const params = buildIdeasSectionsQuery({
      page: 2,
      limit: 12,
      filters: { searchString: "  balões  " },
    });

    expect(Object.keys(params).sort()).toEqual(
      ["limit", "order", "page", "searchString", "sort"].sort(),
    );
    expect(params.searchString).toBe("balões");
  });

  it("busca vazia não vira filtro", () => {
    expect(
      buildIdeasSectionsQuery({
        page: 1,
        limit: 12,
        filters: { searchString: "   " },
      }).searchString,
    ).toBeUndefined();
  });

  it("o corpo da ideia leva só o que o DTO aceita", () => {
    const payload = toSectionPayload(section);

    expect(Object.keys(payload).sort()).toEqual(
      ["description", "medias", "public", "title"].sort(),
    );
    expect(Object.keys(payload.medias[0]).sort()).toEqual(
      [
        "description",
        "id",
        "isLocalFile",
        "mediaType",
        "originalName",
        "platformType",
        "size",
        "title",
        "uploadType",
        "url",
      ].sort(),
    );
    // `fileField` é nome interno do servidor e não é aceito na requisição.
    expect(payload.medias[0]).not.toHaveProperty("fileField");
    expect(payload.medias[0]).not.toHaveProperty("createdAt");
  });

  it("o multipart leva o JSON no campo combinado e cada arquivo no seu", () => {
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    const formData = buildSectionFormData(toSectionPayload(section), [
      { fieldKey: "image_upload", file },
    ]);

    expect(formData.get(IDEAS_SECTION_PAYLOAD_FIELD)).toBe(
      JSON.stringify(toSectionPayload(section)),
    );
    // É o `fieldKey` que religa arquivo e mídia do outro lado.
    expect(formData.get("image_upload")).toBeInstanceOf(File);
  });

  it("distingue a ideia pendente da já publicada", () => {
    expect(isPending(section)).toBe(true);
    expect(isPending({ ...section, pageId: "page-1" })).toBe(false);
  });

  it("resume as mídias e o tamanho dos arquivos", () => {
    expect(mediaSummary(section)).toBe("1 mídia");
    expect(mediaSummary({ ...section, medias: [] })).toBe("Sem mídias");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(null)).toBe("—");
  });

  it("corta o texto no limite, preferindo a borda da palavra", () => {
    expect(truncate("Ideia curta", 100)).toBe("Ideia curta");

    // Espaço perto do fim: corta ali e a frase continua legível.
    expect(truncate("clubinho de sabado feliz", 20)).toBe("clubinho de sabado…");

    // Espaço logo no começo: cortar nele jogaria fora quase tudo, então o
    // corte é no limite mesmo.
    expect(truncate("uma frase razoavelmente longa aqui", 20)).toBe(
      "uma frase razoavelme…",
    );
  });
});

describe("revisão da ideia", () => {
  const draft = (
    medias: IdeasSectionDraft["medias"] = [],
  ): IdeasSectionDraft => ({
    id: "section-1",
    title: "  Brincadeira dos balões  ",
    description: "  Ideia para sábado  ",
    public: true,
    medias,
  });

  const uploaded = (name: string) =>
    new File(["conteudo"], name, { type: "image/png" });

  it("lê a ideia da API no formato editável", () => {
    const editable = toSectionDraft(section);

    expect(editable.id).toBe("section-1");
    expect(editable.public).toBe(false);
    // Os nulos do contrato viram texto vazio: os campos do editor são textos.
    expect(editable.medias[0].title).toBe("Foto");
    expect(editable.medias[0].description).toBe("");
  });

  it("numera o campo multipart a partir do segundo arquivo do mesmo tipo", () => {
    expect(buildUploadFieldKey("image", 1)).toBe("image_upload");
    expect(buildUploadFieldKey("image", 2)).toBe("image2_upload");
  });

  it("liga cada arquivo à sua mídia pelo fieldKey", () => {
    const primeira = uploaded("a.png");
    const segunda = uploaded("b.png");

    const { payload, uploads } = buildReviewSubmission(
      draft([
        {
          title: "Foto 1",
          description: "",
          mediaType: MediaType.IMAGE,
          uploadType: MediaUploadType.UPLOAD,
          url: "",
          file: primeira,
        },
        {
          title: "Foto 2",
          description: "",
          mediaType: MediaType.IMAGE,
          uploadType: MediaUploadType.UPLOAD,
          url: "",
          file: segunda,
        },
      ]),
    );

    expect(uploads).toEqual([
      { fieldKey: "image_upload", file: primeira },
      { fieldKey: "image2_upload", file: segunda },
    ]);
    expect(payload.medias.map((media) => media.fieldKey)).toEqual([
      "image_upload",
      "image2_upload",
    ]);
    expect(payload.medias[0].originalName).toBe("a.png");
  });

  it("mantém a url guardada quando a edição não troca o arquivo", () => {
    // Sem a url a API perderia o objeto já gravado no S3.
    const { payload, uploads } = buildReviewSubmission(
      draft([
        {
          id: "media-1",
          title: "Foto",
          description: "",
          mediaType: MediaType.IMAGE,
          uploadType: MediaUploadType.UPLOAD,
          isLocalFile: true,
          url: "https://s3/foto.png",
          originalName: "foto.png",
          size: 10,
        },
      ]),
    );

    expect(uploads).toHaveLength(0);
    expect(payload.medias[0]).toMatchObject({
      id: "media-1",
      url: "https://s3/foto.png",
      originalName: "foto.png",
    });
  });

  it("preserva a plataforma das mídias de link", () => {
    const { payload } = buildReviewSubmission(
      draft([
        {
          title: "Vídeo",
          description: "",
          mediaType: MediaType.VIDEO,
          uploadType: MediaUploadType.LINK,
          url: "https://youtu.be/abc",
          platformType: MediaPlatform.YOUTUBE,
        },
      ]),
    );

    expect(payload.medias[0]).toMatchObject({
      uploadType: "link",
      isLocalFile: false,
      url: "https://youtu.be/abc",
      platformType: "youtube",
    });
  });

  it("descarta a mídia que ficou sem arquivo e sem endereço", () => {
    // Antes ela subia mesmo assim e a publicação quebrava do outro lado.
    const { payload } = buildReviewSubmission(
      draft([
        {
          title: "Vazia",
          description: "",
          mediaType: MediaType.DOCUMENT,
          uploadType: MediaUploadType.UPLOAD,
          url: "",
        },
      ]),
    );

    expect(payload.medias).toHaveLength(0);
  });

  it("apara título e descrição antes de enviar", () => {
    const { payload } = buildReviewSubmission(draft());

    expect(payload.title).toBe("Brincadeira dos balões");
    expect(payload.description).toBe("Ideia para sábado");
    expect(payload.public).toBe(true);
  });

  it("divide a opção de ordenação em campo e direção", () => {
    expect(parseSortOption("title:ASC")).toEqual({
      sort: "title",
      order: "ASC",
    });
    expect(parseSortOption("qualquer")).toEqual({
      sort: "createdAt",
      order: "DESC",
    });
  });
});
