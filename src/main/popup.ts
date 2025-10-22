function createPopupStyles(position: number = 1) {
    let alignPosition: string[] = ['start', 'center', 'end'];
    if (document.getElementById('popup-styles')) return;

    const style = document.createElement('style');
    style.id = 'popup-styles';
    style.textContent = `
    .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: ${alignPosition[position]}};
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
    `
    document.head.appendChild(style);
}

export function showPopup(message: string, duration: number = 3000, position: number = 1) {
    createPopupStyles(position);
    const overlay = document.createElement('div');
    overlay.className = "overlay";
    const popup = document.createElement('div');
    popup.className = "popup";
    popup.textContent = message;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

 

    overlay.offsetWidth;
    overlay.classList.add("show");
    setTimeout(() => {
        overlay.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }, duration);

   

}

