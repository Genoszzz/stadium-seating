import { X, MousePointer, ArrowRight, Keyboard, Monitor } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const sections = [
  {
    icon: <MousePointer size={18} />,
    title: '鼠标操作',
    color: '#4fc3f7',
    items: [
      '单击座位 → 切换占座（空 ↔ 已坐），右侧面板可查看详情',
      '右击座位 → 删除该座位（已占座的也能删）',
      '右击已删除座位（空位） → 恢复到原位',
      'Shift + 单击座位 → 多选（绿色边框），右击批量删除',
      'Shift + 拖拽空白区域 → 框选座位',
      '拖拽空白区域 → 平移画布（随时可用）',
      '滚轮 → 缩放画布',
      '拖拽选中区域 → 移动区域位置（自动吸附 40px 网格）',
      '单击区域背景 → 选中区域，右侧面板编辑属性',
    ],
  },
  {
    icon: <ArrowRight size={18} />,
    title: '视觉说明',
    color: '#c8d6e5',
    items: [
      '蓝色边框 = 当前选中的座位（右侧面板显示详情）',
      '绿色边框 = 已多选的座位（Shift+点击加入）',
      '彩色填充 = 已占座',
      '深灰色 = 空置座位',
      '空位 = 已删除的座位（右键空位恢复）',
      '固定座位 = 颜色略深，不可删除/切换（在右侧面板切换固定状态）',
    ],
  },
  {
    icon: <Keyboard size={18} />,
    title: '键盘快捷键（选中座位后可用）',
    color: '#ffd54f',
    items: [
      'Space → 切换占座状态',
      'F → 固定/取消固定',
      'Delete → 删除选中座位（多选时批量删除所有选中）',
      'Escape → 取消所有选中',
    ],
  },
  {
    icon: <Monitor size={18} />,
    title: '全局功能',
    color: '#722ed1',
    items: [
      '添加座位区 → 创建新区域',
      '全部清空 → 全部标记为空置',
      '字母排座 → 输入英文后点击"应用"',
      '导出画布 → 整张画布导出 PNG',
      '导出PNG/导出MD数据 → 右侧面板导出单个区域',
    ],
  },
]

export default function HelpModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="cyber-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className="cyber-modal" style={{ width: '90vw', maxWidth: 720, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="cyber-modal-header" style={{ gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#c8d6e5', fontFamily: 'Orbitron, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
            操作教程
          </span>
          <button className="cyber-btn" onClick={onClose} style={{ padding: '2px 8px', fontSize: 16, lineHeight: 1, marginLeft: 'auto' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sections.map((section, i) => (
              <div key={i} className="cyber-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ color: section.color, display: 'flex' }}>{section.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: section.color, fontFamily: 'Orbitron, sans-serif' }}>
                    {section.title}
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#8899aa', lineHeight: 1.7 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(42,48,80,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#556', fontFamily: 'Orbitron, sans-serif' }}>
            STADIUM 排座系统 v2.0
          </span>
          <button className="cyber-btn-primary" onClick={onClose} style={{ padding: '6px 20px' }}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}
