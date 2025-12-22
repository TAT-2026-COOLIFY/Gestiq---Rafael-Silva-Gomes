import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProjectCommunications.css"; // Se tiver renomeado para ProjectCommunications.css

function ProjectCommunications({ projectId }) {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCommunication, setNewCommunication] = useState({
    description: "",
    objective: "",
    sender: "",
    recipient: "",
    channel: "EMAIL",
    frequency: "ONCE",
  });

  useEffect(() => {
    // Só busca se tiver projectId válido
    if (projectId) {
        fetchCommunications();
    }
  }, [projectId]);

  const fetchCommunications = () => {
    api
      .get(`communications/?project=${projectId}`)
      .then((response) => {
        const lista = response.data.results
          ? response.data.results
          : response.data;
        setCommunications(lista);
        setLoading(false);
      })
      .catch((error) => console.error("Erro ao buscar comunicações:", error));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. DEBUG: Verifique no Console (F12) se o projectId aparece aqui
    console.log("Tentando salvar no Projeto ID:", projectId);

    if (!projectId) {
        alert("Erro: ID do Projeto não encontrado.");
        return;
    }

    const dados = {
      project: projectId, // O ID vem da prop
      description: newCommunication.description,
      objective: newCommunication.objective,
      sender: newCommunication.sender,
      recipient: newCommunication.recipient,
      channel: newCommunication.channel,
      frequency: newCommunication.frequency,
    };

    api
      .post("communications/", dados)
      .then((response) => {
        setCommunications([...communications, response.data]);

        // Limpa o formulário
        setNewCommunication({
          description: "",
          objective: "",
          sender: "",
          recipient: "",
          channel: "EMAIL",
          frequency: "ONCE",
        });
        alert("Comunicação adicionada!");
      })
      .catch((error) => {
        console.error("Erro no POST:", error);
        // Mostra o erro exato que o Backend devolveu
        const msg = error.response?.data
          ? JSON.stringify(error.response.data)
          : "Erro desconhecido";
        alert("Erro ao criar: " + msg);
      });
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta comunicação?")) {
      api
        .delete(`communications/${id}/`)
        .then(() => {
          // Correção: Use 'comm' ou 'item' para não confundir com o state 'communications'
          setCommunications(communications.filter((comm) => comm.id !== id));
        })
        .catch((error) => alert("Erro ao excluir."));
    }
  };

  return (
    <div className="communication-container">
      <div className="communication-form-box">
        <h3>🚨 Adicionar Nova Comunicação</h3>

        {/* Use uma classe diferente se quiser separar o CSS do Risco */}
        <form onSubmit={handleSubmit} className="communication-grid"> 
          <label htmlFor="description">Descrição</label>
          <label htmlFor="objective">Objetivo</label>
          <label htmlFor="sender">Remetente</label>
          <label htmlFor="recipient">Destinatário</label>
          <label htmlFor="channel">Meio</label>
          <label htmlFor="frequency">Frequência</label>
          <span></span>

          <input
            name="description"
            id="description"
            type="text"
            value={newCommunication.description}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, description: e.target.value })
            }
            required
          />

          <input
            name="objective"
            id="objective"
            type="text"
            value={newCommunication.objective}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, objective: e.target.value })
            }
            required
          />

          <input
            name="sender"
            id="sender"
            type="text"
            value={newCommunication.sender}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, sender: e.target.value })
            }
            required
          />

          <input
            name="recipient"
            id="recipient"
            type="text"
            value={newCommunication.recipient}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, recipient: e.target.value })
            }
            required
          />

          <select
            name="channel"
            id="channel"
            value={newCommunication.channel}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, channel: e.target.value })
            }
          >
            <option value="EMAIL">E-mail</option>
            <option value="TEAMS">Teams</option>
            <option value="WHATS">WhatsApp</option>
            <option value="PHONE">Telefone</option>
            <option value="MEET">Reunião Presencial</option>
            <option value="OL_MEET">Reunião Online</option>
          </select>

          <select
            name="frequency"
            id="frequency"
            value={newCommunication.frequency}
            onChange={(e) =>
              setNewCommunication({ ...newCommunication, frequency: e.target.value })
            }
          >
            <option value="ONCE">Uma única vez</option>
            <option value="DAILY">Diária</option>
            <option value="WEEKLY">Semanal</option>
            <option value="MONTHLY">Mensal</option>
            <option value="MEETING">Após cada reunião</option>
            <option value="NEEDED">Conforme Necessário</option>
          </select>

          <button type="submit" className="btn-add">
            +
          </button>
        </form>
      </div>

      {/* TABELA DE RESULTADOS */}
      <table className="communication-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Objetivo</th>
            <th>Remetente</th>
            <th>Destinatário</th>
            <th>Meio</th>
            <th>Frequência</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {communications.map((communication) => {
            return (
              <tr key={communication.id}>
                <td>{communication.description}</td>
                <td>{communication.objective}</td>
                <td>{communication.sender}</td>
                <td>{communication.recipient}</td>
                <td>
                    { 
                        communication.channel === 'EMAIL' ? 'E-mail' : 
                        communication.channel === 'TEAMS' ? 'Teams' :
                        communication.channel === 'WHATS' ? 'WhatsApp' :
                        communication.channel === 'PHONE' ? 'Telefone' :
                        communication.channel === 'MEET' ? 'Reunião Presencial' :
                        communication.channel === 'OL_MEET' ? 'Reunião Online' :
                        communication.channel
                    }
                </td>
                <td>
                    { 
                        communication.frequency === 'ONCE' ? 'Uma única vez' : 
                        communication.frequency === 'DAILY' ? 'Diário' :
                        communication.frequency === 'WEEKLY' ? 'Semanal' :
                        communication.frequency === 'MONTHLY' ? 'Mensal' :
                        communication.frequency === 'MEETING' ? 'Após cada reunião' :
                        communication.frequency === 'NEEDED' ? 'Conforme Necessário' :
                        communication.frequency
                    }
                </td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(communication.id)} 
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectCommunications;