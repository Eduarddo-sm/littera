import{s as d}from"./supabase-DontodQT.js";let r="todas",c=null,i=[];async function v(){try{const{data:{user:e}}=await d.auth.getUser();if(!e)return console.error("Usuário não autenticado"),[];const{data:a,error:t}=await d.from("propostas").select(`
        *,
        anuncios (
          titulo,
          autora,
          imagens
        ),
        profiles!propostas_anunciante_id_fkey (
          username,
          avatar_url,
          phone
        )
      `).eq("interessado_id",e.id).order("created_at",{ascending:!1});return t?(console.error("Erro ao buscar propostas:",t),[]):a||[]}catch(e){return console.error("Erro inesperado:",e),[]}}function p(e){return new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}function g(e){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(e)}function E(e){const a=document.createElement("div");a.className=`proposta-card ${e.status==="cancelada"?"cancelada":""}`,a.dataset.status=e.status;const t=`status-${e.status}`,s={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[e.status]||e.status,n=e.anuncios?.titulo||"Anúncio removido",o=e.imagens&&e.imagens.length>0?e.imagens[0]:e.anuncios?.imagens&&e.anuncios.imagens.length>0?e.anuncios.imagens[0]:"";return a.innerHTML=`
    <div class="proposta-header">
      <div>
        <h3 class="proposta-titulo">${n}</h3>
        <p class="proposta-anuncio">${e.anuncios?.autora||""}</p>
      </div>
      <span class="status-badge ${t}">${s}</span>
    </div>
    
    <div class="proposta-info">
      <p class="proposta-mensagem">${e.mensagem||"Sem mensagem"}</p>
      <div class="proposta-valor">${g(e.valor_oferecido)}</div>
      ${o?`<img src="${o}" alt="Imagem da proposta" class="proposta-imagem" />`:""}
      <p class="proposta-data">Enviada em ${p(e.created_at)}</p>
    </div>

    <div class="proposta-actions">
      <button class="btn btn-details" data-id="${e.id}">Ver Detalhes</button>
      ${e.status==="pendente"?`<button class="btn btn-cancel" data-id="${e.id}">Cancelar</button>`:""}
    </div>
  `,a}function h(e){const a=document.getElementById("propostas-container");if(a){if(a.innerHTML="",e.length===0){a.innerHTML=`
      <div class="empty-state">
        <h3>Nenhuma proposta encontrada</h3>
        <p>Você ainda não enviou nenhuma proposta${r!=="todas"?" com este status":""}.</p>
      </div>
    `;return}e.forEach(t=>{a.appendChild(E(t))}),L()}}function f(e){r=e;let a=i;e!=="todas"&&(a=i.filter(t=>t.status===e)),h(a),document.querySelectorAll(".filter-btn").forEach(t=>{t.classList.remove("active"),t.getAttribute("data-filter")===e&&t.classList.add("active")})}async function y(e){try{const{error:a}=await d.from("propostas").update({status:"cancelada"}).eq("id",e);return a?(console.error("Erro ao cancelar proposta:",a),alert("Erro ao cancelar proposta. Tente novamente."),!1):!0}catch(a){return console.error("Erro inesperado:",a),alert("Erro ao cancelar proposta. Tente novamente."),!1}}function $(e){const a=i.find(l=>l.id===e);if(!a)return;const t=document.getElementById("details-modal"),s=document.getElementById("details-body");if(!t||!s)return;const n={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[a.status]||a.status,o=`status-${a.status}`;let u="";a.imagens&&a.imagens.length>0&&(u=`
      <div class="detail-row">
        <div class="detail-label">Imagens Enviadas:</div>
        <div class="detail-images">
          ${a.imagens.map(l=>`<img src="${l}" alt="Imagem da proposta" class="detail-image" />`).join("")}
        </div>
      </div>
    `);let m="";a.status==="aceita"&&a.profiles?.phone&&(m=`
      <div class="detail-row contact-info">
        <div class="detail-label">📱 Telefone do Anunciante para Contato:</div>
        <div class="detail-value">
          <a href="tel:${a.profiles.phone}" style="font-size: 1.2rem; font-weight: 600; color: #065f46;">
            ${a.profiles.phone}
          </a>
        </div>
      </div>
    `),s.innerHTML=`
    <div class="detail-row">
      <div class="detail-label">Anúncio:</div>
      <div class="detail-value">${a.anuncios?.titulo||"Anúncio removido"}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Autor do Livro:</div>
      <div class="detail-value">${a.anuncios?.autora||"N/A"}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Status:</div>
      <div class="detail-value">
        <span class="status-badge ${o}">${n}</span>
      </div>
    </div>

    ${m}

    <div class="detail-row">
      <div class="detail-label">Valor Oferecido:</div>
      <div class="detail-value" style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">
        ${g(a.valor_oferecido)}
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Mensagem:</div>
      <div class="detail-value">${a.mensagem||"Sem mensagem"}</div>
    </div>

    ${u}

    <div class="detail-row">
      <div class="detail-label">Data de Envio:</div>
      <div class="detail-value">${p(a.created_at)}</div>
    </div>
  `,t.classList.add("active")}function L(){document.querySelectorAll(".btn-details").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const t=e.dataset.id;t&&$(t)})}),document.querySelectorAll(".btn-cancel").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const t=e.dataset.id;if(t){c=t;const s=document.getElementById("cancel-modal");s&&s.classList.add("active")}})})}document.addEventListener("DOMContentLoaded",async()=>{i=await v(),h(i),document.querySelectorAll(".filter-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-filter");n&&f(n)})});const e=document.getElementById("cancel-modal"),a=document.getElementById("confirm-cancel"),t=document.getElementById("cancel-cancel");a&&a.addEventListener("click",async()=>{c&&await y(c)&&(i=await v(),f(r),e&&e.classList.remove("active"),c=null)}),t&&t.addEventListener("click",()=>{e&&e.classList.remove("active"),c=null}),document.querySelectorAll(".close-modal").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(n=>{n.classList.remove("active")})})}),document.querySelectorAll(".modal").forEach(s=>{s.addEventListener("click",n=>{n.target===s&&s.classList.remove("active")})})});
