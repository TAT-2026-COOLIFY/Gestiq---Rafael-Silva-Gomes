import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProjectTeam.css"; 

function ProjectTeam({ projectId }) {
  const [members, setMembers] = useState([]);
  
  // Mudamos de 'selectedUser' (ID) para 'emailInvite' (Texto)
  const [emailInvite, setEmailInvite] = useState(""); 
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchMembers();
    // NÃO PRECISA MAIS DO fetchAllUsers! O site fica mais leve.
  }, [projectId]);

  const fetchMembers = () => {
    api.get(`members/?project=${projectId}`)
      .then(res => setMembers(res.data.results || res.data))
      .catch(console.error);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!emailInvite) return alert("Por favor, digite um e-mail.");

    api.post('members/', {
        project: projectId,
        email: emailInvite,
        function: role 
    })
    .then(res => {
        // Atualiza a lista visualmente
        fetchMembers(); 
        
        // Limpa os campos
        setEmailInvite("");
        setRole("");
        alert("Usuário adicionado com sucesso!");
    })
    .catch(err => {
        // Mostra a mensagem de erro que configuramos no Python (ex: "Usuário não encontrado")
        const msg = err.response?.data?.detail || "Erro ao adicionar membro.";
        alert(msg);
    });
  };

  const handleRemoveMember = (id) => {
    if (confirm("Remover este usuário da equipe?")) {
        api.delete(`members/${id}/`)
            .then(() => setMembers(members.filter(m => m.id !== id)))
            .catch(() => alert("Erro ao remover."));
    }
  };

  return (
    <div className="team-container">
      
      {/* CARD DE CONVITE */}
      <div className="add-member-box">
        <h3>➕ Convidar Membro</h3>
        <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '10px'}}>
            Digite o e-mail do usuário para adicioná-lo ao projeto. <br/>
            (O usuário já deve ter cadastro no sistema).
        </p>

        <form onSubmit={handleAddMember} className="form-inline">
            {/* INPUT DE E-MAIL (Substitui o Select) */}
            <input 
                type="email" 
                placeholder="exemplo@email.com"
                value={emailInvite}
                onChange={e => setEmailInvite(e.target.value)}
                required
                className="input-email"
            />

            <input 
                type="text" 
                placeholder="Função (ex: Dev, PO)"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="input-role"
            />

            <button type="submit" className="btn-add">Adicionar</button>
        </form>
      </div>

      {/* GRID DE MEMBROS (MANTIDO IGUAL) */}
      <div className="members-grid">
        {members.map(member => (
            <div key={member.id} className="member-card">
    
                <div className="avatar">
                    {member.photo ? (
                        <img 
                            src={member.photo} 
                            alt="Foto de perfil" 
                            style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                        />
                    ) : (
                        (member.nome_completo || member.username || member.email || "?")[0].toUpperCase()
                    )}
                </div>

                <div className="member-info">
                    <h4>{member.nome_completo || member.username}</h4>
                    
                    <span>
                        {member.function || "Membro"}
                    </span>

                    <span>
                        {member.email ? member.email : "Sem email definido"}
                    </span>
                    
                    <span>
                        {member.job_title ? member.job_title : "Sem cargo definido"}
                    </span>

                    <span>
                        {member.department ? member.department : "Sem área definida"}
                    </span>
                </div>

                <button 
                    className="btn-remove" 
                    onClick={() => handleRemoveMember(member.id)}
                >
                    &times;
                </button>
            </div>
        ))}
        </div>

    </div>
  );
}

export default ProjectTeam;