type SizeName = "Pequena" | "Média" | "Grande";
type Payment = "Pix" | "Cartão" | "Dinheiro";
type Border = "Sem borda" | "Cheddar" | "Catupiry";

type PizzaName =
  | "Portuguesa"
  | "À Moda da Casa"
  | "Frango com Milho"
  | "Frango com Catupiry";

type CartItem = {
  id: string;
  name: string;
  size?: SizeName;
  unitPrice: number;
  qty: number;
  border?: Border;
};

type Hotspot = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  action: () => void;
};

const PHONE = "5561999927072";
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const app = document.querySelector<HTMLDivElement>("#app")!;

let cart: CartItem[] = [];
let payment: Payment = "Pix";

const styles = {
  fixedButton: {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    zIndex: "50",
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: "999px",
    background: "#2d1408",
    color: "#fff",
    padding: "13px 18px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 35px rgba(0,0,0,.45)",
  },
  drawer: {
    position: "fixed",
    inset: "0 0 0 auto",
    width: "min(430px, 100vw)",
    background: "#fff7e6",
    color: "#2c1409",
    zIndex: "100",
    boxShadow: "-20px 0 60px rgba(0,0,0,.5)",
    padding: "20px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  overlay: {
    position: "fixed",
    inset: "0",
    zIndex: "90",
    background: "rgba(0,0,0,.62)",
    backdropFilter: "blur(3px)",
  },
  darkBtn: {
    width: "100%",
    border: "0",
    borderRadius: "12px",
    padding: "14px 16px",
    background: "#321506",
    color: "#fff",
    fontWeight: "800",
    cursor: "pointer",
  },
} satisfies Record<string, Partial<CSSStyleDeclaration>>;

function applyStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, style);
}

function button(text: string, onClick: () => void, style: Partial<CSSStyleDeclaration> = {}) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = text;
  el.addEventListener("click", onClick);
  applyStyle(el, {
    border: "0",
    borderRadius: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: "800",
    ...style,
  });
  return el;
}

function toast(message: string) {
  const el = document.createElement("div");
  el.textContent = message;
  applyStyle(el, {
    position: "fixed",
    left: "50%",
    bottom: "78px",
    transform: "translateX(-50%)",
    zIndex: "160",
    background: "#fff7e6",
    color: "#2c1409",
    padding: "11px 16px",
    borderRadius: "999px",
    fontWeight: "800",
    boxShadow: "0 12px 35px rgba(0,0,0,.4)",
    maxWidth: "calc(100vw - 36px)",
    textAlign: "center",
  });
  document.body.append(el);
  setTimeout(() => el.remove(), 1700);
}

function addPizza(name: PizzaName, size: SizeName, price: number) {
  const id = `${name}-${size}`;
  const found = cart.find((i) => i.id === id && (i.border ?? "Sem borda") === "Sem borda");
  if (found) found.qty += 1;
  else cart.push({ id, name, size, unitPrice: price, qty: 1, border: "Sem borda" });
  updateCartButton();
  toast(`${name} • ${size} adicionada`);
}

function addDrink(name: string, price: number) {
  const id = name;
  const found = cart.find((i) => i.id === id);
  if (found) found.qty += 1;
  else cart.push({ id, name, unitPrice: price, qty: 1 });
  updateCartButton();
  toast(`${name} adicionado`);
}

function itemTotal(item: CartItem) {
  const borderPrice = item.border && item.border !== "Sem borda" ? 4 : 0;
  return (item.unitPrice + borderPrice) * item.qty;
}

function total() {
  return cart.reduce((sum, item) => sum + itemTotal(item), 0);
}

function updateCartButton() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartButton.textContent = `🛒 Pedido${count ? ` (${count})` : ""}`;
}

function openBorderHint() {
  if (!cart.some((i) => i.size)) {
    toast("Escolha uma pizza primeiro 🍕");
    return;
  }
  openCart();
  toast("Escolha Cheddar ou Catupiry na pizza");
}

function createHotspot(h: Hotspot) {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("aria-label", h.label);
  el.title = h.label;
  el.addEventListener("click", h.action);
  applyStyle(el, {
    position: "absolute",
    left: `${h.x}%`,
    top: `${h.y}%`,
    width: `${h.w}%`,
    height: `${h.h}%`,
    border: "2px solid transparent",
    borderRadius: "12px",
    background: "transparent",
    cursor: "pointer",
    transition: "120ms ease",
  });
  el.addEventListener("mouseenter", () => {
    el.style.borderColor = "rgba(255,208,87,.95)";
    el.style.background = "rgba(255,208,87,.10)";
    el.style.boxShadow = "0 0 0 3px rgba(76,31,7,.25) inset";
  });
  el.addEventListener("mouseleave", () => {
    el.style.borderColor = "transparent";
    el.style.background = "transparent";
    el.style.boxShadow = "none";
  });
  return el;
}

function percentRect(x: number, y: number, w: number, h: number): Pick<Hotspot, "x"|"y"|"w"|"h"> {
  return {
    x: (x / 1672) * 100,
    y: (y / 941) * 100,
    w: (w / 1672) * 100,
    h: (h / 941) * 100,
  };
}

const hotspots: Hotspot[] = [
  { id: "pt-p", label: "Portuguesa Pequena — R$ 20,00", ...percentRect(100, 188, 160, 58), action: () => addPizza("Portuguesa", "Pequena", 20) },
  { id: "pt-m", label: "Portuguesa Média — R$ 28,00", ...percentRect(277, 188, 158, 58), action: () => addPizza("Portuguesa", "Média", 28) },
  { id: "pt-g", label: "Portuguesa Grande — R$ 40,00", ...percentRect(455, 188, 160, 58), action: () => addPizza("Portuguesa", "Grande", 40) },

  { id: "moda-p", label: "À Moda da Casa Pequena — R$ 20,00", ...percentRect(82, 417, 177, 56), action: () => addPizza("À Moda da Casa", "Pequena", 20) },
  { id: "moda-m", label: "À Moda da Casa Média — R$ 28,00", ...percentRect(277, 417, 160, 56), action: () => addPizza("À Moda da Casa", "Média", 28) },
  { id: "moda-g", label: "À Moda da Casa Grande — R$ 40,00", ...percentRect(457, 417, 165, 56), action: () => addPizza("À Moda da Casa", "Grande", 40) },

  { id: "milho-p", label: "Frango com Milho Pequena — R$ 20,00", ...percentRect(151, 620, 153, 54), action: () => addPizza("Frango com Milho", "Pequena", 20) },
  { id: "milho-m", label: "Frango com Milho Média — R$ 28,00", ...percentRect(314, 620, 157, 54), action: () => addPizza("Frango com Milho", "Média", 28) },
  { id: "milho-g", label: "Frango com Milho Grande — R$ 40,00", ...percentRect(485, 620, 155, 54), action: () => addPizza("Frango com Milho", "Grande", 40) },

  { id: "cat-p", label: "Frango com Catupiry Pequena — R$ 20,00", ...percentRect(145, 825, 150, 54), action: () => addPizza("Frango com Catupiry", "Pequena", 20) },
  { id: "cat-m", label: "Frango com Catupiry Média — R$ 28,00", ...percentRect(306, 825, 157, 54), action: () => addPizza("Frango com Catupiry", "Média", 28) },
  { id: "cat-g", label: "Frango com Catupiry Grande — R$ 40,00", ...percentRect(477, 825, 158, 54), action: () => addPizza("Frango com Catupiry", "Grande", 40) },

  { id: "gua", label: "Guaraná 2 litros — R$ 13,00", ...percentRect(1234, 157, 126, 52), action: () => addDrink("Guaraná 2L", 13) },
  { id: "coca", label: "Coca-Cola 2 litros — R$ 13,00", ...percentRect(1490, 157, 128, 52), action: () => addDrink("Coca-Cola 2L", 13) },
  { id: "borda", label: "Adicionar borda de Cheddar ou Catupiry — R$ 4,00", ...percentRect(1130, 402, 200, 60), action: openBorderHint },
];

const stage = document.createElement("main");
applyStyle(stage, {
  width: "100%",
  minHeight: "100vh",
  display: "grid",
  placeItems: "start center",
  background: "#1d0b04",
});

const posterWrap = document.createElement("section");
posterWrap.setAttribute("aria-label", "Cardápio Pizza Gourmet Mais Sabor");
applyStyle(posterWrap, {
  position: "relative",
  width: "min(100vw, 1672px)",
  aspectRatio: "1672 / 941",
  overflow: "hidden",
  background: "#2a1208",
  boxShadow: "0 18px 60px rgba(0,0,0,.5)",
});

const poster = document.createElement("img");
poster.src = "./assets/cardapio.png";
poster.alt = "Cardápio Pizza Gourmet Mais Sabor com pizzas, bebidas, bordas, endereço e contato.";
poster.draggable = false;
applyStyle(poster, {
  position: "absolute",
  inset: "0",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  userSelect: "none",
  webkitUserSelect: "none",
});
posterWrap.append(poster);
hotspots.forEach((h) => posterWrap.append(createHotspot(h)));
stage.append(posterWrap);
app.append(stage);

const cartButton = document.createElement("button");
cartButton.type = "button";
cartButton.setAttribute("aria-label", "Abrir pedido");
applyStyle(cartButton, styles.fixedButton);
cartButton.addEventListener("click", openCart);
document.body.append(cartButton);
updateCartButton();

function openCart() {
  const overlay = document.createElement("div");
  applyStyle(overlay, styles.overlay);
  overlay.addEventListener("click", () => close());

  const drawer = document.createElement("aside");
  drawer.setAttribute("aria-label", "Seu pedido");
  applyStyle(drawer, styles.drawer);

  function close() {
    overlay.remove();
    drawer.remove();
  }

  const header = document.createElement("div");
  applyStyle(header, { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" });
  const title = document.createElement("h2");
  title.textContent = "Seu pedido";
  applyStyle(title, { margin: "0", fontSize: "26px" });
  header.append(title, button("✕", close, { background: "transparent", color: "#2c1409", fontSize: "22px" }));
  drawer.append(header);

  const list = document.createElement("div");
  drawer.append(list);

  const paymentWrap = document.createElement("div");
  applyStyle(paymentWrap, { borderTop: "1px solid rgba(44,20,9,.18)", paddingTop: "16px", marginTop: "16px" });
  const paymentLabel = document.createElement("label");
  paymentLabel.textContent = "Forma de pagamento";
  applyStyle(paymentLabel, { display: "block", fontWeight: "800", marginBottom: "8px" });
  const select = document.createElement("select");
  ["Pix", "Cartão", "Dinheiro"].forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.append(opt);
  });
  select.value = payment;
  select.addEventListener("change", () => payment = select.value as Payment);
  applyStyle(select, { width: "100%", border: "1px solid #bcae93", borderRadius: "10px", padding: "12px", background: "white", color: "#2c1409", fontSize: "16px" });
  paymentWrap.append(paymentLabel, select);
  drawer.append(paymentWrap);

  const footer = document.createElement("div");
  applyStyle(footer, { position: "sticky", bottom: "-20px", background: "#fff7e6", paddingTop: "16px", paddingBottom: "8px", marginTop: "18px" });
  drawer.append(footer);

  function renderItems() {
    list.replaceChildren();
    footer.replaceChildren();

    if (!cart.length) {
      const empty = document.createElement("p");
      empty.textContent = "Seu pedido está vazio.";
      applyStyle(empty, { opacity: ".72", textAlign: "center", padding: "36px 0" });
      list.append(empty);
    } else {
      cart.forEach((item) => {
        const card = document.createElement("div");
        applyStyle(card, { background: "#fff", border: "1px solid rgba(44,20,9,.12)", borderRadius: "14px", padding: "13px", marginBottom: "10px" });

        const row = document.createElement("div");
        applyStyle(row, { display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" });
        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = item.name;
        const meta = document.createElement("div");
        meta.textContent = item.size ? `${item.size} • ${money.format(item.unitPrice)}` : money.format(item.unitPrice);
        applyStyle(meta, { fontSize: "13px", opacity: ".72", marginTop: "3px" });
        info.append(name, meta);

        const remove = button("Remover", () => {
          cart = cart.filter((i) => i !== item);
          updateCartButton();
          renderItems();
        }, { background: "transparent", color: "#8b2d1c", padding: "3px" });
        row.append(info, remove);
        card.append(row);

        if (item.size) {
          const borderLabel = document.createElement("label");
          borderLabel.textContent = "Borda";
          applyStyle(borderLabel, { display: "block", fontSize: "12px", fontWeight: "800", marginTop: "10px", marginBottom: "5px" });
          const borderSelect = document.createElement("select");
          ["Sem borda", "Cheddar", "Catupiry"].forEach((border) => {
            const opt = document.createElement("option");
            opt.value = border;
            opt.textContent = border === "Sem borda" ? border : `${border} (+ R$ 4,00)`;
            borderSelect.append(opt);
          });
          borderSelect.value = item.border ?? "Sem borda";
          borderSelect.addEventListener("change", () => {
            item.border = borderSelect.value as Border;
            renderItems();
          });
          applyStyle(borderSelect, { width: "100%", border: "1px solid #d5c8af", borderRadius: "9px", padding: "9px", marginBottom: "10px", background: "#fffdf8" });
          card.append(borderLabel, borderSelect);
        }

        const controls = document.createElement("div");
        applyStyle(controls, { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" });
        const qty = document.createElement("div");
        applyStyle(qty, { display: "flex", alignItems: "center", gap: "10px" });
        qty.append(
          button("−", () => { item.qty = Math.max(1, item.qty - 1); updateCartButton(); renderItems(); }, { background: "#f0e5d1", color: "#2c1409", width: "34px", height: "34px", padding: "0" }),
          Object.assign(document.createElement("strong"), { textContent: String(item.qty) }),
          button("+", () => { item.qty += 1; updateCartButton(); renderItems(); }, { background: "#f0e5d1", color: "#2c1409", width: "34px", height: "34px", padding: "0" })
        );
        const subtotal = document.createElement("strong");
        subtotal.textContent = money.format(itemTotal(item));
        controls.append(qty, subtotal);
        card.append(controls);
        list.append(card);
      });
    }

    const totalRow = document.createElement("div");
    applyStyle(totalRow, { display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "900", marginBottom: "12px" });
    totalRow.innerHTML = `<span>Total</span><span>${money.format(total())}</span>`;
    footer.append(totalRow);

    const continueBtn = button("Continuar", () => {
      if (!cart.length) return toast("Adicione pelo menos um item");
      close();
      openCheckout();
    });
    applyStyle(continueBtn, styles.darkBtn);
    footer.append(continueBtn);
  }

  renderItems();
  document.body.append(overlay, drawer);
}

function openCheckout() {
  const overlay = document.createElement("div");
  applyStyle(overlay, styles.overlay);

  const modal = document.createElement("section");
  applyStyle(modal, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: "120",
    width: "min(520px, calc(100vw - 28px))",
    maxHeight: "90vh",
    overflowY: "auto",
    boxSizing: "border-box",
    background: "#fff7e6",
    color: "#2c1409",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 22px 70px rgba(0,0,0,.55)",
  });

  const h = document.createElement("h2");
  h.textContent = "Entrega";
  applyStyle(h, { margin: "0 0 14px", fontSize: "26px" });

  const label = document.createElement("label");
  label.textContent = "Endereço de entrega";
  applyStyle(label, { display: "block", fontWeight: "800", marginBottom: "7px" });

  const address = document.createElement("textarea");
  address.placeholder = "Rua, quadra, conjunto, casa/apto e referência";
  address.rows = 4;
  applyStyle(address, { width: "100%", boxSizing: "border-box", resize: "vertical", border: "1px solid #bcae93", borderRadius: "10px", padding: "12px", fontSize: "16px", marginBottom: "14px" });

  const summary = document.createElement("div");
  applyStyle(summary, { background: "#fff", borderRadius: "12px", padding: "12px", marginBottom: "14px", border: "1px solid rgba(44,20,9,.12)" });
  summary.innerHTML = `<strong>Pagamento:</strong> ${payment}<br><strong>Total:</strong> ${money.format(total())}`;

  const send = button("Enviar pedido no WhatsApp", () => {
    const addr = address.value.trim();
    if (!addr) {
      address.focus();
      toast("Informe o endereço de entrega");
      return;
    }
    const lines = cart.map((item) => {
      const border = item.size && item.border && item.border !== "Sem borda" ? ` | borda ${item.border}` : "";
      const size = item.size ? ` | ${item.size}` : "";
      return `• ${item.qty}x ${item.name}${size}${border} — ${money.format(itemTotal(item))}`;
    });
    const message = [
      "Olá! Quero fazer este pedido:",
      "",
      ...lines,
      "",
      `Total: ${money.format(total())}`,
      `Pagamento: ${payment}`,
      `Endereço: ${addr}`,
    ].join("\n");
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });
  applyStyle(send, styles.darkBtn);

  const back = button("Voltar ao pedido", () => { overlay.remove(); modal.remove(); openCart(); }, { background: "transparent", color: "#2c1409", width: "100%", marginTop: "8px" });
  const close = () => { overlay.remove(); modal.remove(); };
  overlay.addEventListener("click", close);

  modal.append(h, label, address, summary, send, back);
  document.body.append(overlay, modal);
}
