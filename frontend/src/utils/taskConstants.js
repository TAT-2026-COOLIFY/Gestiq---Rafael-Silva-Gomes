export const COLUMNS = [
  { id: "PLAN", title: "A Iniciar" },
  { id: "DOING", title: "Em Andamento" },
  { id: "REVIEW", title: "Em Validação" },
  { id: "DONE", title: "Concluída" },
];

export const TYPES = [
  { id: "TASK", title: "Tarefa" },
  { id: "BUG", title: "Bug" },
  { id: "STORY", title: "História" },
];

export const PRIORITIES = [
  { id: "LOW", title: "Baixa" },
  { id: "MEDIUM", title: "Média" },
  { id: "HIGH", title: "Alta" },
  { id: "CRITICAL", title: "Crítica" },
];

export const INITIAL_TASK = {
  title: "",
  description: "",
  status: "PLAN",
  type: "TASK",
  priority: "MEDIUM",
  milestone: "",
  assigned_to: "",
};
