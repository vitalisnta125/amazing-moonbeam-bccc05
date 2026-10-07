import { useState } from "react";
import { X } from "lucide-react";
import { usePersistentState } from "../../lib/use-persistent-state";
import { Panel } from "../ui/Panel";

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

export function GoalsPanel() {
  const [goals, setGoals] = usePersistentState<Goal[]>("goals", []);
  const [draft, setDraft] = useState("");

  function addGoal() {
    const text = draft.trim();
    if (!text) return;
    setGoals((g) => [...g, { id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, text, done: false }]);
    setDraft("");
  }

  const done = goals.filter((g) => g.done).length;

  return (
    <Panel label="Goals" meta={goals.length ? `${done}/${goals.length} done` : undefined} className="h-full">
      {goals.length === 0 ? (
        <p className="text-[13px] text-fg-3 m-0 mb-3">Add what a disciplined session looks like for you.</p>
      ) : (
        <ul className="m-0 p-0 list-none mb-3 divide-y divide-line-soft">
          {goals.map((goal) => (
            <li key={goal.id} className="group flex items-center gap-2.5 py-1.5">
              <button
                onClick={() => setGoals((g) => g.map((x) => (x.id === goal.id ? { ...x, done: !x.done } : x)))}
                className="check-box cursor-pointer p-0 bg-transparent"
                data-checked={goal.done}
                aria-label={goal.done ? "Mark not done" : "Mark done"}
              >
                {goal.done ? "✓" : ""}
              </button>
              <span className={`flex-1 text-[13px] ${goal.done ? "text-fg-3 line-through" : "text-fg"}`}>{goal.text}</span>
              <button
                onClick={() => setGoals((g) => g.filter((x) => x.id !== goal.id))}
                className="lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 text-fg-3 hover:text-red bg-transparent border-none cursor-pointer p-0.5"
                aria-label="Remove goal"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
          placeholder="Add a goal…"
          className="field"
        />
        <button onClick={addGoal} className="btn btn-secondary">
          Add
        </button>
      </div>
    </Panel>
  );
}
