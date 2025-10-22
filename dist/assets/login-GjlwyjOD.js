import{s as r}from"./supabase-B9cvm4hE.js";function i(t=1){if(document.getElementById("popup-styles"))return;let n=["start","center","end"];const o=document.createElement("style");o.id="popup-styles",o.textContent=`
    .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: ${n[t]}};
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: opacity 0.3s ease;
}

.overlay.show {
    opacity: 1;
    pointer-events: auto;
}

.popup {

    background: white;
    padding: 20px;
    border-radius: 10px;
    font-size: 18px;
    transform: scale(0.8);
    transition: transform 0.3s ease;
}

.overlay.show .popup {
    transform: scale(1);
}

    `,document.head.appendChild(o)}function l(t,n=3e3,o=1){i(o);const e=document.createElement("div");e.className="overlay";const a=document.createElement("div");a.className="popup",a.textContent=t,e.appendChild(a),document.body.appendChild(e),e.offsetWidth,e.classList.add("show"),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>{document.body.removeChild(e)},300)},n)}async function d(t,n){try{const{data:o,error:e}=await r.auth.signInWithPassword({email:t,password:n});return e?(console.error("Login error:",e),alert(`Erro no login: ${e.message}`),!1):o.session.user?!0:(console.warn("Login returned no user data",o),alert("Não foi possível efetuar o login. Tente novamente."),!1)}catch(o){return console.error("Unexpected signIn error",o),alert("Erro inesperado ao tentar logar. Veja o console para mais detalhes."),!1}}document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("loginForm");if(!t){console.warn("loginForm não encontrado no DOM.");return}t.addEventListener("submit",async n=>{n.preventDefault();const o=document.getElementById("email"),e=document.getElementById("password");if(!o||!e)return alert("Campos de email ou senha não encontrados na página."),!1;const a=o.value.trim(),s=e.value;if(!a||!s){alert("Preencha email e senha antes de enviar.");return}await d(a,s)&&(l("Login realizado com sucesso!",2e3,2),setTimeout(()=>{window.location.href="/index.html"},2e3))})});
