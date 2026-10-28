import assert from "node:assert/strict"
import { test } from "node:test"
import { render } from "preact-render-to-string"
import KnowledgeHome from "./KnowledgeHome"
import { QuartzComponentProps } from "./types"

// 使用虚构的公开文章元数据验证导航，不读取或发布用户的真实笔记。
const page = (slug: string, extra = {}) => ({ slug, frontmatter: { title: slug, ...extra } })
const renderHome = (files: unknown[], slug = "index") =>
  render(
    <KnowledgeHome
      {...({
        fileData: { slug },
        allFiles: files,
      } as QuartzComponentProps)}
    />,
  )

test("empty site has a readable state and no dead category links", () => {
  const html = renderHome([page("index"), page("404"), page("tags/index")])
  assert.match(html, /0 个分类 · 0 篇笔记/)
  assert.match(html, /知识，正在积累/)
  assert.doesNotMatch(html, /knowledge-card/)
})

test("nested notes share their top-level category; hidden notes do not leak", () => {
  const html = renderHome([
    page("index"),
    page("图像算法/index"),
    page("图像算法/ViT"),
    page("图像算法/基础/入门"),
    page("秘密/草稿", { draft: true }),
    page("秘密/隐藏", { unlisted: true }),
    page("秘密/加密", { password: "test-only" }),
    page("独立笔记"),
  ])
  // 防止将目录索引重复计数，或为未公开的分类生成入口。
  assert.match(html, /1 个分类 · 3 篇笔记/)
  assert.match(html, /2 篇笔记/)
  assert.match(html, /href="\.\/图像算法\//)
  assert.match(html, /其他笔记/)
  assert.doesNotMatch(html, /秘密/)
})

test("home component does not appear on article pages", () => {
  assert.equal(renderHome([page("分类/文章")], "分类/文章"), "")
})
