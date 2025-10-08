import{s as d}from"./supabase-BafKp-QD.js";let l="todas",c=null,i=[];async function m(){try{const{data:{user:a}}=await d.auth.getUser();if(!a)return console.error("Usuário não autenticado"),[];const{data:e,error:t}=await d.from("propostas").select(`
        *,
        anuncios (
          titulo,
          autora,
          imagens
        ),
        profiles!propostas_anunciante_id_fkey (
          username,
          avatar_url
        )
      `).eq("interessado_id",a.id).order("created_at",{ascending:!1});return t?(console.error("Erro ao buscar propostas:",t),[]):e||[]}catch(a){return console.error("Erro inesperado:",a),[]}}function f(a){return new Date(a).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}function p(a){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(a)}function E(a){const e=document.createElement("div");e.className=`proposta-card ${a.status==="cancelada"?"cancelada":""}`,e.dataset.status=a.status;const t=`status-${a.status}`,s={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[a.status]||a.status,n=a.anuncios?.titulo||"Anúncio removido",o=a.imagens&&a.imagens.length>0?a.imagens[0]:a.anuncios?.imagens&&a.anuncios.imagens.length>0?a.anuncios.imagens[0]:"";return e.innerHTML=`
    <div class="proposta-header">
      <div>
        <h3 class="proposta-titulo">${n}</h3>
        <p class="proposta-anuncio">${a.anuncios?.autora||""}</p>
      </div>
      <span class="status-badge ${t}">${s}</span>
    </div>
    
    <div class="proposta-info">
      <p class="proposta-mensagem">${a.mensagem||"Sem mensagem"}</p>
      <div class="proposta-valor">${p(a.valor_oferecido)}</div>
      ${o?`<img src="${o}" alt="Imagem da proposta" class="proposta-imagem" />`:""}
      <p class="proposta-data">Enviada em ${f(a.created_at)}</p>
    </div>

    <div class="proposta-actions">
      <button class="btn btn-details" data-id="${a.id}">Ver Detalhes</button>
      ${a.status==="pendente"?`<button class="btn btn-cancel" data-id="${a.id}">Cancelar</button>`:""}
    </div>
  `,e}function g(a){const e=document.getElementById("propostas-container");if(e){if(e.innerHTML="",a.length===0){e.innerHTML=`
      <div class="empty-state">
        <h3>Nenhuma proposta encontrada</h3>
        <p>Você ainda não enviou nenhuma proposta${l!=="todas"?" com este status":""}.</p>
      </div>
    `;return}a.forEach(t=>{e.appendChild(E(t))}),$()}}function v(a){l=a;let e=i;a!=="todas"&&(e=i.filter(t=>t.status===a)),g(e),document.querySelectorAll(".filter-btn").forEach(t=>{t.classList.remove("active"),t.getAttribute("data-filter")===a&&t.classList.add("active")})}async function h(a){try{const{error:e}=await d.from("propostas").update({status:"cancelada"}).eq("id",a);return e?(console.error("Erro ao cancelar proposta:",e),alert("Erro ao cancelar proposta. Tente novamente."),!1):!0}catch(e){return console.error("Erro inesperado:",e),alert("Erro ao cancelar proposta. Tente novamente."),!1}}function y(a){const e=i.find(r=>r.id===a);if(!e)return;const t=document.getElementById("details-modal"),s=document.getElementById("details-body");if(!t||!s)return;const n={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[e.status]||e.status,o=`status-${e.status}`;let u="";e.imagens&&e.imagens.length>0&&(u=`
      <div class="detail-row">
        <div class="detail-label">Imagens Enviadas:</div>
        <div class="detail-images">
          ${e.imagens.map(r=>`<img src="${r}" alt="Imagem da proposta" class="detail-image" />`).join("")}
        </div>
      </div>
    `),s.innerHTML=`
    <div class="detail-row">
      <div class="detail-label">Anúncio:</div>
      <div class="detail-value">${e.anuncios?.titulo||"Anúncio removido"}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Autor do Livro:</div>
      <div class="detail-value">${e.anuncios?.autora||"N/A"}</div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Status:</div>
      <div class="detail-value">
        <span class="status-badge ${o}">${n}</span>
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Valor Oferecido:</div>
      <div class="detail-value" style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">
        ${p(e.valor_oferecido)}
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Mensagem:</div>
      <div class="detail-value">${e.mensagem||"Sem mensagem"}</div>
    </div>

    ${u}

    <div class="detail-row">
      <div class="detail-label">Data de Envio:</div>
      <div class="detail-value">${f(e.created_at)}</div>
    </div>
  `,t.classList.add("active")}function $(){document.querySelectorAll(".btn-details").forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const t=a.dataset.id;t&&y(t)})}),document.querySelectorAll(".btn-cancel").forEach(a=>{a.addEventListener("click",e=>{e.stopPropagation();const t=a.dataset.id;if(t){c=t;const s=document.getElementById("cancel-modal");s&&s.classList.add("active")}})})}document.addEventListener("DOMContentLoaded",async()=>{i=await m(),g(i),document.querySelectorAll(".filter-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-filter");n&&v(n)})});const a=document.getElementById("cancel-modal"),e=document.getElementById("confirm-cancel"),t=document.getElementById("cancel-cancel");e&&e.addEventListener("click",async()=>{c&&await h(c)&&(i=await m(),v(l),a&&a.classList.remove("active"),c=null)}),t&&t.addEventListener("click",()=>{a&&a.classList.remove("active"),c=null}),document.querySelectorAll(".close-modal").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(n=>{n.classList.remove("active")})})}),document.querySelectorAll(".modal").forEach(s=>{s.addEventListener("click",n=>{n.target===s&&s.classList.remove("active")})})});
