export function BoardPage() {
  const columns = [
    { title: "New", count: 12, color: "bg-muted-foreground" },
    { title: "In Progress", count: 4, color: "bg-primary" },
    { title: "Under Review", count: 8, color: "bg-amber-500" },
    { title: "Completed", count: 15, color: "bg-accent-foreground" },
  ];

  const sampleTasks: Record<string, { title: string; desc: string; tags: { label: string; color: string }[] }[]> = {
    "New": [
      { title: "Final export: Dribbble pack", desc: "Export MP4, GIF + poster frame (still).", tags: [{ label: "Files", color: "bg-muted text-muted-foreground" }] },
      { title: "Readability Check", desc: "Ensure text stays readable during motion.", tags: [{ label: "QA", color: "bg-accent text-accent-foreground" }] },
    ],
    "In Progress": [
      { title: "Animate Page Entrance", desc: "Sidebar, header + top cards + board reveal.", tags: [{ label: "Motion", color: "bg-primary/15 text-primary" }] },
      { title: "Column Counters", desc: "Animate column counts, highlight states.", tags: [{ label: "Motion", color: "bg-primary/15 text-primary" }] },
    ],
    "Under Review": [
      { title: "Card Microinteractions Set", desc: "Hover lift, quick actions reveal, tag pop-in.", tags: [{ label: "Motion", color: "bg-primary/15 text-primary" }] },
      { title: "Create Motion Style Guide", desc: "Define durations for micro/transition, curves.", tags: [{ label: "System", color: "bg-accent text-accent-foreground" }, { label: "Files", color: "bg-muted text-muted-foreground" }] },
    ],
    "Completed": [
      { title: "Storyboard v2 complete", desc: "Create a narrative with happenings.", tags: [{ label: "Files", color: "bg-muted text-muted-foreground" }] },
      { title: "Build Kanban transitions", desc: "Animate card lift effects between cols.", tags: [{ label: "Motion", color: "bg-primary/15 text-primary" }] },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Task Tracker</h3>
          <p className="text-muted-foreground text-sm">Wednesday, {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">Priority: Any</span>
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">Category: All</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.title} className="w-80 shrink-0 flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                <h4 className="font-semibold text-sm text-foreground">{col.title}</h4>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {col.count}
                </span>
              </div>
              <span className="text-muted-foreground text-lg cursor-pointer hover:text-foreground">+</span>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {(sampleTasks[col.title] || []).map((task, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <h5 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {task.title}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {task.desc}
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {task.tags.map((tag, j) => (
                      <span
                        key={j}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-md ${tag.color}`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Drop zone */}
              <div className="border-2 border-dashed border-border/60 rounded-xl h-20 flex items-center justify-center text-muted-foreground/30 text-xs">
                Drop here
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
