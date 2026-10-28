import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import KnowledgeHome from "./quartz/components/KnowledgeHome"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()

// YAML 会为每种页面生成独立布局，所以同时注册默认与页面类型布局。
// 组件内部只在根首页渲染；文章、分类页继续使用 Quartz 原有正文。
for (const pageLayout of [layout.defaults, ...Object.values(layout.byPageType)]) {
  pageLayout.afterBody = [...(pageLayout.afterBody ?? []), KnowledgeHome]
}

// v5 在加载配置时就创建页面渲染器，单独导出 layout 不会更新该实例。
// 用扩展后的布局替换同名渲染器，保留其余生成器及 YAML 定义的页面类型。
config.plugins.emitters = config.plugins.emitters.map((emitter) =>
  emitter.name === "PageTypeDispatcher" ? PageTypeDispatcher(layout) : emitter,
)
