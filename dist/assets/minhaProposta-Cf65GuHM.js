import{s as d,a as v}from"./popup-B9BBiTrj.js";/* empty css              */let r="todas",o=null,i=[];async function f(){try{const{data:{user:e}}=await d.auth.getUser();if(!e)return console.error("Usuário não autenticado"),[];const{data:a,error:t}=await d.from("propostas").select(`
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
      `).eq("interessado_id",e.id).order("created_at",{ascending:!1});return t?(console.error("Erro ao buscar propostas:",t),[]):a||[]}catch(e){return console.error("Erro inesperado:",e),[]}}function g(e){return new Date(e).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}function h(e){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(e)}function y(e){const a=document.createElement("div");a.className=`proposta-card ${e.status==="cancelada"?"cancelada":""}`,a.dataset.status=e.status;const t=`status-${e.status}`,s={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[e.status]||e.status,n=e.anuncios?.titulo||"Anúncio removido",c=e.imagens&&e.imagens.length>0?e.imagens[0]:e.anuncios?.imagens&&e.anuncios.imagens.length>0?e.anuncios.imagens[0]:"";return a.innerHTML=`
    <div class="proposta-header">
      <div>
        <h3 class="proposta-titulo">${n}</h3>
        <p class="proposta-anuncio">${e.anuncios?.autora||""}</p>
      </div>
      <span class="status-badge ${t}">${s}</span>
    </div>
    
    <div class="proposta-info">
      <p class="proposta-mensagem">${e.mensagem||"Sem mensagem"}</p>
      <div class="proposta-valor">${h(e.valor_oferecido)}</div>
      ${c?`<img src="${c}" alt="Imagem da proposta" class="proposta-imagem" />`:""}
      <p class="proposta-data">Enviada em ${g(e.created_at)}</p>
    </div>

    <div class="proposta-actions">
      <button class="btn btn-details" data-id="${e.id}">Ver Detalhes</button>
      ${e.status==="pendente"?`<button class="btn btn-cancel" data-id="${e.id}">Cancelar</button>`:""}
    </div>
  `,a}function E(e){const a=document.getElementById("propostas-container");if(a){if(a.innerHTML="",e.length===0){a.innerHTML=`
      <div class="empty-state">
        <h3>Nenhuma proposta encontrada</h3>
        <p>Você ainda não enviou nenhuma proposta${r!=="todas"?" com este status":""}.</p>
      </div>
    `;return}e.forEach(t=>{a.appendChild(y(t))}),b()}}function p(e){r=e;let a=i;e!=="todas"&&(a=i.filter(t=>t.status===e)),E(a),document.querySelectorAll(".filter-btn").forEach(t=>{t.classList.remove("active"),t.getAttribute("data-filter")===e&&t.classList.add("active")})}async function $(e){try{const{error:a}=await d.from("propostas").update({status:"cancelada"}).eq("id",e);return a?(console.error("Erro ao cancelar proposta:",a),v("Erro ao cancelar proposta. Tente novamente.",3e3,0),!1):!0}catch(a){return console.error("Erro inesperado:",a),v("Erro ao cancelar proposta. Tente novamente.",3e3,0),!1}}function L(e){const a=i.find(l=>l.id===e);if(!a)return;const t=document.getElementById("details-modal"),s=document.getElementById("details-body");if(!t||!s)return;const n={pendente:"Pendente",aceita:"Aceita",recusada:"Recusada",cancelada:"Cancelada"}[a.status]||a.status,c=`status-${a.status}`;let u="";a.imagens&&a.imagens.length>0&&(u=`
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
        <span class="status-badge ${c}">${n}</span>
      </div>
    </div>

    ${m}

    <div class="detail-row">
      <div class="detail-label">Valor Oferecido:</div>
      <div class="detail-value" style="font-size: 1.5rem; font-weight: 700; color: #4f46e5;">
        ${h(a.valor_oferecido)}
      </div>
    </div>

    <div class="detail-row">
      <div class="detail-label">Mensagem:</div>
      <div class="detail-value">${a.mensagem||"Sem mensagem"}</div>
    </div>

    ${u}

    <div class="detail-row">
      <div class="detail-label">Data de Envio:</div>
      <div class="detail-value">${g(a.created_at)}</div>
    </div>
  `,t.classList.add("active")}function b(){document.querySelectorAll(".btn-details").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const t=e.dataset.id;t&&L(t)})}),document.querySelectorAll(".btn-cancel").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const t=e.dataset.id;if(t){o=t;const s=document.getElementById("cancel-modal");s&&s.classList.add("active")}})})}document.addEventListener("DOMContentLoaded",async()=>{i=await f(),E(i),document.querySelectorAll(".filter-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.getAttribute("data-filter");n&&p(n)})});const e=document.getElementById("cancel-modal"),a=document.getElementById("confirm-cancel"),t=document.getElementById("cancel-cancel");a&&a.addEventListener("click",async()=>{o&&await $(o)&&(i=await f(),p(r),e&&e.classList.remove("active"),o=null)}),t&&t.addEventListener("click",()=>{e&&e.classList.remove("active"),o=null}),document.querySelectorAll(".close-modal").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(n=>{n.classList.remove("active")})})}),document.querySelectorAll(".modal").forEach(s=>{s.addEventListener("click",n=>{n.target===s&&s.classList.remove("active")})})});
