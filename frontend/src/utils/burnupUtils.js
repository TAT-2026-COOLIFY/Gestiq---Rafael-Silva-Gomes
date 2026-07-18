export function generateBurnupData(sprint, tasks) {
  if (!sprint || !sprint.start_date || !sprint.end_date) return [];

  const start = new Date(`${sprint.start_date}T00:00:00`);
  const end = new Date(`${sprint.end_date}T23:59:59`);
  const hoje = new Date();

  // Calcula o total de dias da sprint para descobrir a taxa ideal de entrega
  const totalMilissegundos = end.getTime() - start.getTime();
  const totalDias = Math.ceil(totalMilissegundos / (1000 * 60 * 60 * 24)) || 1;

  const chartData = [];
  let dataAtual = new Date(start);

  const escopoTotal = tasks.reduce(
    (acc, t) => acc + (parseFloat(t.story_points) || 0),
    0,
  );

  // A taxa ideal é o escopo dividido pelos dias disponíveis.
  // (totalDias - 1) garante que o último dia bata exatamente com 100% do escopo
  const taxaIdealDiaria =
    totalDias > 1 ? escopoTotal / (totalDias - 1) : escopoTotal;

  let diaIndex = 0;

  while (dataAtual <= end) {
    // 👇 Formatação manual para "15/07"
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const dataString = `${dia}/${mes}`;

    const fimDoDia = new Date(dataAtual);
    fimDoDia.setHours(23, 59, 59, 999);

    const concluidoAteO_Dia = tasks.reduce((acc, task) => {
      if (task.status === "DONE" && task.end_date) {
        const dataConclusao = new Date(`${task.end_date}T00:00:00`);
        if (dataConclusao <= fimDoDia) {
          return acc + (parseFloat(task.story_points) || 0);
        }
      }
      return acc;
    }, 0);

    const registro = {
      name: dataString,
      "Escopo Total": escopoTotal,
      // 👇 Adiciona a meta do dia na linha Ideal (arredondada para 1 casa decimal)
      Ideal: Number((taxaIdealDiaria * diaIndex).toFixed(1)),
    };

    if (fimDoDia <= hoje || dataAtual.toDateString() === hoje.toDateString()) {
      registro["Trabalho Concluído"] = concluidoAteO_Dia;
    }

    chartData.push(registro);

    dataAtual.setDate(dataAtual.getDate() + 1);
    diaIndex++;
  }

  return chartData;
}
