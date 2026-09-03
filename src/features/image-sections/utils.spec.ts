import { describe, expect, it } from "vitest";

import { IMAGE_SECTION_PAYLOAD_FIELD } from "./constants";
import {
  buildImageSectionsQuery,
  buildSectionFormData,
  buildSectionUpload,
  imageMedias,
  isPending,
  mediaSummary,
  truncate,
} from "./utils";
import type { ImageSectionResponse } from "./types";

const section: ImageSectionResponse = {
  id: "section-1",
  caption: "Páscoa no Clubinho 12",
  description: "Fotos da manhã de sábado",
  public: false,
  pageId: null,
  mediaItems: [
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
    {
      id: "media-2",
      title: "Vídeo",
      description: null,
      uploadType: "link",
      mediaType: "video",
      isLocalFile: false,
      url: "https://youtube.com/x",
      platformType: "youtube",
      originalName: null,
      size: null,
    },
  ],
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-02T10:00:00.000Z",
};

/**
 * Trava o formato do que sai daqui para a API.
 *
 * `QueryImageSectionsDto` e os DTOs de entrada recusam propriedade
 * desconhecida, então um campo a mais derruba a requisição com 400.
 */
describe("image-sections utils", () => {
  it("a fila envia só o que QueryImageSectionsDto aceita", () => {
    const params = buildImageSectionsQuery({
      page: 2,
      limit: 12,
      filters: { searchString: "  páscoa  ", approved: false, hasMedia: true },
    });

    expect(Object.keys(params).sort()).toEqual(
      [
        "approved",
        "hasMedia",
        "limit",
        "order",
        "page",
        "searchString",
        "sort",
      ].sort(),
    );
    expect(params.searchString).toBe("páscoa");
    expect(params.approved).toBe(false);
  });

  it("busca vazia não vira filtro", () => {
    expect(
      buildImageSectionsQuery({
        page: 1,
        limit: 12,
        filters: { searchString: "   " },
      }).searchString,
    ).toBeUndefined();
  });

  it("o multipart leva o JSON no campo combinado e cada arquivo no seu", () => {
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    const payload = {
      caption: section.caption,
      description: section.description,
      mediaItems: [],
    };

    const formData = buildSectionFormData(payload, [
      { fieldKey: "file_0", file },
    ]);

    expect(formData.get(IMAGE_SECTION_PAYLOAD_FIELD)).toBe(
      JSON.stringify(payload),
    );
    // É o `fieldKey` que religa arquivo e mídia do outro lado.
    expect(formData.get("file_0")).toBeInstanceOf(File);
  });

  it("distingue a publicação pendente da já aprovada", () => {
    expect(isPending(section)).toBe(true);
    expect(isPending({ ...section, pageId: "page-1" })).toBe(false);
  });

  it("a grade mostra só as imagens", () => {
    // A publicação pode carregar vídeo; a tira de miniaturas é de fotos.
    expect(imageMedias(section).map((m) => m.id)).toEqual(["media-1"]);
  });

  it("resume a quantidade de fotos", () => {
    expect(mediaSummary(section)).toBe("2 fotos");
    expect(mediaSummary({ ...section, mediaItems: [] })).toBe("Sem fotos");
  });

  it("corta o texto no limite, preferindo a borda da palavra", () => {
    expect(truncate("Legenda curta", 100)).toBe("Legenda curta");
    expect(truncate("clubinho de sabado feliz", 20)).toBe("clubinho de sabado…");
  });

  describe("buildSectionUpload", () => {
    const base = {
      caption: "Páscoa",
      description: "Fotos",
      mediaItems: [
        {
          id: "media-1",
          title: "Vídeo da gincana",
          uploadType: "link",
          mediaType: "video",
          isLocalFile: false,
          url: "https://youtube.com/x",
          platformType: "youtube",
        },
      ],
    };

    it("preserva o tipo de cada mídia", () => {
      // A versão anterior marcava tudo como imagem, então um vídeo anexado
      // voltava do servidor como foto.
      const { payload } = buildSectionUpload(base);

      expect(payload.mediaItems[0].mediaType).toBe("video");
      expect(payload.mediaItems[0].uploadType).toBe("link");
    });

    it("dá um fieldKey ao arquivo novo e o separa para o multipart", () => {
      const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
      const { payload, uploads } = buildSectionUpload({
        ...base,
        mediaItems: [
          {
            title: "Foto",
            uploadType: "upload",
            mediaType: "image",
            isLocalFile: true,
            file,
          },
        ],
      });

      expect(payload.mediaItems[0].fieldKey).toBe("file_0");
      expect(payload.mediaItems[0].originalName).toBe("foto.jpg");
      expect(uploads).toEqual([{ fieldKey: "file_0", file }]);
    });

    it("só leva `public` quando a revisão decide", () => {
      // Na criação o campo não existe; a API recusa se ele chegar.
      expect(buildSectionUpload(base).payload).not.toHaveProperty("public");
      expect(buildSectionUpload({ ...base, public: true }).payload.public).toBe(
        true,
      );
    });
  });
});
