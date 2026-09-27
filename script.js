const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".side-menu");
const menuCloseButton = document.querySelector(".menu-close");
const scrim = document.querySelector(".scrim");
const searchButton = document.querySelector(".search-toggle");
const searchPanel = document.querySelector(".search-panel");
const cartButton = document.querySelector(".cart-toggle");
const brandTabs = document.querySelectorAll(".brand-tab");
const categoryMenu = document.querySelector(".category-menu");
const pageAnchorPrefix = document.body.classList.contains("product-body") ? "index.html" : "";

const brandCategories = {
  market: [
    [
      ["What’s new", "#new"],
      ["Fashion", "#products"],
      ["Food", "#stories"],
      ["Life", "#stories"],
      ["Culture", "#stories"],
    ],
    [
      ["Outdoor", "#products"],
      ["Vegan", "#products"],
    ],
  ],
  yay: [
    [
      ["All", "#products"],
      ["New", "#new"],
      ["Outer", "#products"],
      ["Top", "#products"],
      ["Bottom", "#products"],
    ],
    [
      ["Inner", "#products"],
      ["Bag", "#products"],
      ["Shoes", "#products"],
    ],
  ],
};

function renderBrandCategories(brand) {
  categoryMenu.replaceChildren(
    ...brandCategories[brand].map((column) => {
      const group = document.createElement("div");
      column.forEach(([label, href]) => {
        const link = document.createElement("a");
        link.href = `${pageAnchorPrefix}${href}`;
        link.textContent = label;
        link.addEventListener("click", closePanels);
        group.append(link);
      });
      return group;
    }),
  );
}

brandTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    brandTabs.forEach((item) => {
      const isSelected = item === tab;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-selected", String(isSelected));
    });
    renderBrandCategories(tab.dataset.brand);
  });
});

function closePanels() {
  menu.classList.remove("is-open");
  searchPanel.classList.remove("is-open");
  menuButton.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");
  searchPanel.setAttribute("aria-hidden", "true");
  scrim.hidden = true;
}

menuButton.addEventListener("click", () => {
  const willOpen = !menu.classList.contains("is-open");
  closePanels();
  if (willOpen) {
    menu.classList.add("is-open");
    menuButton.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
  }
});

searchButton.addEventListener("click", () => {
  const willOpen = !searchPanel.classList.contains("is-open");
  closePanels();
  if (willOpen) {
    searchPanel.classList.add("is-open");
    searchPanel.setAttribute("aria-hidden", "false");
    document.querySelector("#site-search").focus();
  }
});

cartButton.addEventListener("click", () => {
  closePanels();
  cartButton.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "translateY(0)" }],
    { duration: 280 },
  );
});

scrim.addEventListener("click", closePanels);
menuCloseButton.addEventListener("click", closePanels);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanels();
});
document.querySelectorAll(".side-menu a").forEach((link) => link.addEventListener("click", closePanels));
