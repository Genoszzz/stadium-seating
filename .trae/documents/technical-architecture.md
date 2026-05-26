# 球场/会场排座系统 - 技术架构文档

## 1. 架构设计

```mermaid
graph TD
    A["前端应用层 - React SPA"] --> B["状态管理层 - Zustand Store"]
    A --> C["画布渲染层 - Konva/Canvas"]
    A --> D["UI组件层 - 自定义组件"]
    B --> E["数据模型 - TypeScript Interfaces"]
    D --> F["工具层 - Excel/导出"]
    C --> E
    F --> E
```

纯前端单页应用，无后端、无数据库，所有数据存于内存状态中。

## 2. 技术描述

| 层级 | 技术选型 | 版本 | 用途 |
|------|----------|------|------|
| 框架 | React | ^18.3.1 | UI框架 |
| 语言 | TypeScript | ^5.5.4 | 类型安全 |
| 构建 | Vite | ^5.4.3 | 开发/构建工具 |
| 画布 | Konva + react-konva | ^9.3.15 / ^18.2.10 | 座位布局画布 |
| 状态 | Zustand | ^4.5.2 | 全局状态管理 |
| Excel | xlsx (SheetJS) | ^0.18.5 | Excel读写 |
| 截图 | html2canvas | ^1.4.1 | LED导示图导出 |
| 样式 | CSS Custom Properties | - | 主题系统 |
| 字体 | Google Fonts: Orbitron + Noto Sans SC | - | 标题 + 正文 |

## 3. 路由定义

单页应用，无需路由：

| 路由 | 用途 |
|------|------|
| / | 主工作台（唯一页面，弹窗实现子功能） |

## 4. 组件树

```mermaid
graph TD
    App["App - 根组件"] --> Config["ConfigProvider - 主题配置"]
    App --> Layout["Layout - 三栏布局"]
    Layout --> Toolbar["Toolbar - 顶部工具栏"]
    Layout --> AttendeePanel["AttendeePanel - 左侧人员面板"]
    Layout --> Canvas["Canvas - 中央画布"]
    Canvas --> Stage["Konva Stage"]
    Stage --> Layer["Konva Layer"]
    Layer --> ZoneRenderer["ZoneRenderer - 座位区渲染"]
    ZoneRenderer --> SeatGroup["座位组 Group"]
    Layout --> PropertiesPanel["PropertiesPanel - 右侧属性面板"]
    App --> ExcelModal["ExcelImportModal - Excel导入弹窗"]
    App --> LEDModal["LEDGuideModal - LED导示图弹窗"]
```

## 5. 数据模型

### 5.1 数据模型定义

```mermaid
erDiagram
    SeatZone ||--o{ Seat : contains
    Seat ||--o| Attendee : assigned_to
    Attendee ||--o{ Seat : occupies

    SeatZone {
        string id
        string name
        int rows
        int cols
        int seatWidth
        int seatHeight
        int gapX
        int gapY
        int x
        int y
        int rotation
        string arrangementType
        array aisles
        array seats
        string color
    }

    Seat {
        string id
        int row
        int col
        int x
        int y
        bool assigned
        bool isFixed
    }

    Attendee {
        string id
        string name
        string position
        string department
        int level
    }
```

### 5.2 数据流

```mermaid
flowchart LR
    Excel["Excel文件"] --> Parse["parseExcelFile"]
    Parse --> Attendees["Attendee[]"]
    Attendees --> Store["Zustand Store"]
    Store --> AutoSeat["autoSeatByLevel / autoSeatByOrder"]
    AutoSeat --> Zones["SeatZone[].seats"]
    Zones --> Canvas["Canvas渲染"]
    Canvas --> Drag["拖拽操作"]
    Drag --> Store
    Store --> Export["exportSeatingResult"]
    Export --> ExcelOut["Excel文件"]
```

## 6. 文件结构

```
src/
├── main.tsx              # 入口
├── App.tsx               # 根组件
├── index.css             # 全局样式（赛博主题）
├── types.ts              # TypeScript类型定义
├── store.ts              # Zustand状态管理
├── vite-env.d.ts         # Vite类型声明
├── components/
│   ├── Toolbar.tsx       # 顶部工具栏
│   ├── Canvas.tsx        # Konva画布
│   ├── AttendeePanel.tsx # 待排人员面板
│   ├── PropertiesPanel.tsx # 属性编辑面板
│   ├── ExcelImportModal.tsx # Excel导入弹窗
│   └── LEDGuideModal.tsx # LED导示图弹窗
└── utils/
    └── excel.ts          # Excel读写工具
```
