import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "@/services/api";
import { generateBurnupData } from "@/utils/burnupUtils";
import { BURNUP_CHANGED_EVENT } from "@/utils/burnupEvents";
import { Loading } from "@/components/Loading/Loading";
import styles from "./ProjectBurnup.module.css";

export function ProjectBurnup({ projectId }) {
  const [currentSprint, setCurrentSprint] = useState(null);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [sprintsRes, tasksRes] = await Promise.all([
        api.get(`sprints/?project=${projectId}`),
        api.get(`activities/?project=${projectId}`),
      ]);

      const sprintsData = sprintsRes.data?.results || sprintsRes.data;
      const activeSprint = sprintsData.find((s) => s.status === "ACTIVE");

      setCurrentSprint(activeSprint || null);

      if (activeSprint) {
        const allTasks = tasksRes.data?.results || tasksRes.data;
        setSprintTasks(allTasks.filter((t) => t.sprint === activeSprint.id));
      } else {
        setSprintTasks([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Burnup:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refresh = (event) => {
      if (
        !event.detail?.projectId ||
        event.detail.projectId === String(projectId)
      ) {
        fetchData(false);
      }
    };
    const refreshOnFocus = () => fetchData(false);

    window.addEventListener(BURNUP_CHANGED_EVENT, refresh);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.removeEventListener(BURNUP_CHANGED_EVENT, refresh);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [fetchData, projectId]);

  const data = useMemo(() => {
    return generateBurnupData(currentSprint, sprintTasks);
  }, [currentSprint, sprintTasks]);

  if (loading) return <Loading />;

  if (!currentSprint) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>
            O gráfico de Burnup estará disponível assim que você iniciar uma
            Sprint no quadro Scrum.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Gráfico de Burnup — {currentSprint.name}
        </h3>
        <p className={styles.subtitle}>
          Acompanhe a entrega do escopo planejado dia a dia.
        </p>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--text-muted)"
              strokeOpacity={
                0.30
              }
              vertical={
                false
              }
            />
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              style={{ fontSize: "11px", fontWeight: 500 }}
            />
            <YAxis
              stroke="var(--text-muted)"
              style={{ fontSize: "11px", fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--white)",
                borderColor: "var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="top" height={40} iconType="circle" />

            <Line
              name="Total"
              type="stepAfter"
              dataKey="Escopo Total"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

            <Line
              name="Meta Ideal"
              type="linear"
              dataKey="Ideal"
              stroke="#c69a71"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            <Line
              name="Concluído"
              type="monotone"
              dataKey="Trabalho Concluído"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
