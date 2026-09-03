import { describe, expect, it } from "vitest";

import {
  buildCommentsQuery,
  buildUpdateCommentRequest,
  toCommentFormValues,
  validateCommentForm,
} from "./utils";
import type { CommentResponse } from "./types";

const comment: CommentResponse = {
  id: "comment-1",
  name: "João Pedro",
  comment: "Meu filho ama o clubinho.",
  clubinho: "12",
  neighborhood: "Centro",
  published: false,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-02T10:00:00.000Z",
};

describe("comments utils", () => {
  it("a listagem envia só o que QueryCommentsDto aceita", () => {
    const params = buildCommentsQuery({
      page: 1,
      limit: 12,
      filters: { searchString: "centro", published: true },
    });

    expect(Object.keys(params).sort()).toEqual(
      ["limit", "order", "page", "published", "searchString", "sort"].sort(),
    );
  });

  it("a edição envia só o que mudou", () => {
    const values = { ...toCommentFormValues(comment), comment: "Texto novo" };

    expect(buildUpdateCommentRequest(values, comment)).toEqual({
      comment: "Texto novo",
    });
  });

  it("a edição nunca leva a publicação junto", () => {
    const values = { ...toCommentFormValues(comment), name: "Outro nome" };
    const request = buildUpdateCommentRequest(values, comment);

    // Salvar uma edição não pode publicar o comentário sem querer, que era o
    // que acontecia quando a tela mandava `published: true` no corpo.
    expect(request).not.toHaveProperty("published");
  });

  it("nada mudou significa corpo vazio", () => {
    expect(buildUpdateCommentRequest(toCommentFormValues(comment), comment)).toEqual(
      {},
    );
  });

  it("cobra os quatro campos obrigatórios", () => {
    expect(validateCommentForm(toCommentFormValues(comment))).toEqual({
      name: false,
      comment: false,
      clubinho: false,
      neighborhood: false,
    });

    expect(
      validateCommentForm({
        name: "  ",
        comment: "",
        clubinho: "",
        neighborhood: "",
      }),
    ).toEqual({
      name: true,
      comment: true,
      clubinho: true,
      neighborhood: true,
    });
  });
});
