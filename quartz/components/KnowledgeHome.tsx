import { QuartzComponent, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

/**
 * 首页从 Quartz 已处理的文章集合生成分类，不读取电脑上的 Obsidian 私有目录。
 * 每个一级目录是一类，深层文章计入其所属一级目录；根目录文章单独列出。
 * 排除首页、目录索引和隐藏文章，避免统计虚拟页面或泄露不应出现在导航中的标题。
 */
const KnowledgeHome: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null
  const notes = allFiles.filter((file) => {
    const slug = file.slug
    const meta = file.frontmatter
    return (
      slug &&
      slug !== "index" &&
      slug !== "404" &&
      slug !== "tags" &&
      !slug.endsWith("/index") &&
      !slug.startsWith("tags/") &&
      !meta?.draft &&
      !meta?.unlisted &&
      !meta?.password
    )
  })
  const groups = new Map<string, typeof notes>()
  const rootNotes = notes.filter((file) => !file.slug!.includes("/"))
  for (const file of notes) {
    if (!file.slug!.includes("/")) continue
    const folder = file.slug!.split("/")[0]
    groups.set(folder, [...(groups.get(folder) ?? []), file])
  }
  const folders = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "zh-CN"))
  // 使用 Quartz 的相对链接解析，保留中文及嵌套目录，并兼容站内 SPA 导航。
  const href = (slug: string) => resolveRelative(fileData.slug!, slug as FullSlug)
  return (
    <section class="knowledge-home" aria-label="知识库分类">
      <div class="knowledge-summary">
        <span>按主题探索</span>
        <span>
          {folders.length} 个分类 · {notes.length} 篇笔记
        </span>
      </div>
      {folders.length > 0 && (
        <div class="knowledge-grid">
          {folders.map(([folder, files], index) => (
            <a class="internal knowledge-card" href={href(`${folder}/index`)} key={folder}>
              <span class="knowledge-number">{String(index + 1).padStart(2, "0")}</span>
              {/* URL 使用 slug，显示名称使用原始路径，避免把文件夹中的空格或短横线改错。 */}
              <h2>{files[0].relativePath?.split("/")[0] ?? folder}</h2>
              <p>{files.length} 篇笔记</p>
              <span class="knowledge-action">
                浏览分类 <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
        </div>
      )}
      {rootNotes.length > 0 && (
        <div class="knowledge-root">
          <h2>其他笔记</h2>
          <ul>
            {rootNotes
              .sort((a, b) =>
                String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title), "zh-CN"),
              )
              .map((file) => (
                <li key={file.slug}>
                  <a class="internal" href={href(file.slug!)}>
                    {file.frontmatter?.title ?? file.slug}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
      {notes.length === 0 && (
        <div class="knowledge-empty">
          <h2>知识，正在积累。</h2>
          <p>这里将按主题整理学习笔记、研究记录与实践心得。</p>
          <p>第一篇公开笔记发布后，你可以从这里进入对应分类。</p>
        </div>
      )}
      <p class="knowledge-hint">按分类逐层浏览，或使用搜索查找具体内容。</p>
    </section>
  )
}

// 样式限定在首页组件内，沿用主题变量以兼容深色模式，不影响文章正文布局。
KnowledgeHome.css = `
.knowledge-home { margin: 2rem 0 3rem; }
.knowledge-summary { display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap; padding-bottom:1rem; border-bottom:1px solid var(--lightgray); color:var(--darkgray); font-size:.9rem; }
.knowledge-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-top:1.5rem; }
a.knowledge-card { display:block; background:transparent; padding:1.5rem; border:1px solid var(--lightgray); border-radius:8px; font-weight:400; transition:border-color .2s,background-color .2s; }
a.knowledge-card:hover { border-color:var(--secondary); background:var(--highlight); }
a.knowledge-card:focus-visible { outline:3px solid var(--secondary); outline-offset:4px; }
.knowledge-number { color:var(--secondary); font-size:.85rem; font-family:var(--codeFont); }
.knowledge-card h2 { margin:.8rem 0 .5rem; font-size:1.3rem; overflow-wrap:anywhere; }
.knowledge-card p { color:var(--darkgray); margin:.4rem 0 1.5rem; }
.knowledge-action { display:flex; justify-content:space-between; color:var(--secondary); font-size:.9rem; }
.knowledge-empty { padding:2.5rem 0; border-bottom:1px solid var(--lightgray); }
.knowledge-empty h2 { font-size:1.5rem; margin-top:0; }
.knowledge-empty p,.knowledge-hint { color:var(--darkgray); line-height:1.8; }
.knowledge-hint { font-size:.9rem; margin-top:1.5rem; }
.knowledge-root li a { display:inline-block; padding:.65rem 0; }
body[data-slug="index"] .content-meta { display:none; }
@media(max-width:600px) { .knowledge-grid { grid-template-columns:1fr; } }
@media(prefers-reduced-motion:reduce) { a.knowledge-card { transition:none; } }
`
export default KnowledgeHome
