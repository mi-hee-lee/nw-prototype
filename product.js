const productGallery = document.querySelector(".product-gallery");
const productSlides = [...document.querySelectorAll(".product-slides img")];
const galleryCount = document.querySelector(".gallery-count b");
const galleryMore = document.querySelector(".gallery-more");
let activeSlide = 0;

function showSlide(index) {
  activeSlide = (index + productSlides.length) % productSlides.length;
  productSlides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeSlide));
  document.querySelector(".product-slides").style.transform = `translateX(-${activeSlide * (100 / productSlides.length)}%)`;
  galleryCount.textContent = activeSlide + 1;
}

document.querySelector(".gallery-prev").addEventListener("click", () => showSlide(activeSlide - 1));
document.querySelector(".gallery-next").addEventListener("click", () => showSlide(activeSlide + 1));

const galleryStage = document.querySelector(".product-gallery__stage");
let galleryTouchStartX = 0;
let galleryTouchStartY = 0;

galleryStage.addEventListener("touchstart", (event) => {
  galleryTouchStartX = event.changedTouches[0].clientX;
  galleryTouchStartY = event.changedTouches[0].clientY;
}, { passive: true });

galleryStage.addEventListener("touchend", (event) => {
  const deltaX = event.changedTouches[0].clientX - galleryTouchStartX;
  const deltaY = event.changedTouches[0].clientY - galleryTouchStartY;
  if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  showSlide(activeSlide + (deltaX < 0 ? 1 : -1));
}, { passive: true });

galleryMore.addEventListener("click", () => {
  const expanded = productGallery.classList.toggle("is-expanded");
  galleryMore.innerHTML = `<span>${expanded ? "−" : "＋"}</span> ${expanded ? "Hide images" : "Show more"}`;
  requestAnimationFrame(updatePurchasePanelFooterLimit);
});

const quantityOutput = document.querySelector(".quantity-control output");
const totalOutput = document.querySelector(".product-total b");
const purchaseBottom = document.querySelector(".purchase-bottom");
const productSelects = [...document.querySelectorAll(".product-select")];
const selectedOptions = { color: "", size: "" };
let quantity = 1;

function updateQuantity(nextQuantity) {
  quantity = Math.max(1, nextQuantity);
  quantityOutput.textContent = quantity;
  totalOutput.textContent = (selectedOptions.color && selectedOptions.size ? 45000 * quantity : 0).toLocaleString("ko-KR");
  document.querySelector(".quantity-minus").disabled = quantity === 1;
}

document.querySelector(".quantity-minus").addEventListener("click", () => updateQuantity(quantity - 1));
document.querySelector(".quantity-plus").addEventListener("click", () => updateQuantity(quantity + 1));

function closeProductSelect(select) {
  select.classList.remove("is-open");
  select.querySelector(".product-select__trigger").setAttribute("aria-expanded", "false");
  select.querySelector(".product-select__menu").hidden = true;
}

function updatePurchaseState() {
  const isReady = Boolean(selectedOptions.color && selectedOptions.size);
  purchaseBottom.classList.toggle("is-ready", isReady);
  updateQuantity(quantity);
}

productSelects.forEach((select) => {
  const trigger = select.querySelector(".product-select__trigger");
  const menu = select.querySelector(".product-select__menu");

  trigger.addEventListener("click", () => {
    const willOpen = !select.classList.contains("is-open");
    productSelects.forEach(closeProductSelect);
    if (willOpen) {
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    }
  });

  select.querySelectorAll(".product-select__option:not(:disabled)").forEach((option) => {
    option.addEventListener("click", () => {
      select.querySelectorAll(".product-select__option").forEach((item) => item.setAttribute("aria-selected", String(item === option)));
      selectedOptions[select.dataset.selectName] = option.dataset.value;
      trigger.querySelector("span").textContent = option.textContent;
      select.classList.add("is-selected");
      closeProductSelect(select);
      updatePurchaseState();
    });
  });
});

document.addEventListener("click", (event) => {
  productSelects.forEach((select) => {
    if (!select.contains(event.target)) closeProductSelect(select);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    productSelects.forEach(closeProductSelect);
    if (typeof purchasePanel !== "undefined" && purchasePanel.classList.contains("is-info-view")) closeAdditionalInfo();
    else if (typeof closePurchaseSheet === "function") closePurchaseSheet();
  }
});

const infoCopy = document.querySelector(".product-info-copy");
const purchasePanel = document.querySelector(".product-purchase");
const sheetDim = document.querySelector(".product-sheet-dim");
const additionalInfoPanel = document.querySelector(".additional-info-panel");
const additionalInfoTitle = additionalInfoPanel.querySelector("h2");
const additionalInfoBody = additionalInfoPanel.querySelector(".additional-info-body");
const additionalInfoTable = additionalInfoPanel.querySelector(".additional-info-table");
const additionalInfo = {
  "혜택 안내": {
    title: "혜택안내",
    body: "· 회원가입 및 카카오톡 플러스 친구 추가 시 바로 사용 가능한 3,000원 혜택\n· 구매 금액의 2% 적립\n· 후기 작성시 품목당 최대 1,000 포인트 혜택\n· 생일 축하 5,000 포인트 혜택 (1년 이내 구매 이력 있을 시)",
    rows: [["상품할인", "19% 20,900원"], ["카드할인", "현대카드 20,482원 (2% 청구할인)\n할부금 월 3,483원 (6개월 할부시)"]]
  },
  "주문 및 배송": {
    title: "주문 및 배송",
    body: "결제 완료 후 영업일 기준 2–3일 이내 출고됩니다. 주문량과 배송 지역에 따라 일정이 달라질 수 있습니다.",
    rows: [["배송비", "3,000원"], ["무료배송", "50,000원 이상 구매 시"]]
  },
  "교환 및 환불": {
    title: "교환 및 환불",
    body: "수령 후 7일 이내 미사용 상품에 한해 교환 및 환불이 가능합니다. 상품 훼손 또는 사용 흔적이 있는 경우 처리가 어려울 수 있습니다.",
    rows: [["접수 기간", "수령일로부터 7일 이내"], ["반품 배송비", "왕복 배송비 고객 부담"]]
  }
};

function openAdditionalInfo(label) {
  const content = additionalInfo[label];
  if (!content) return;
  additionalInfoTitle.textContent = content.title;
  additionalInfoBody.textContent = content.body;
  additionalInfoTable.innerHTML = content.rows.map(([term, description]) => `<div><dt>${term}</dt><dd>${description}</dd></div>`).join("");
  purchasePanel.classList.add("is-info-view");
  additionalInfoPanel.setAttribute("aria-hidden", "false");
}

function closeAdditionalInfo() {
  purchasePanel.classList.remove("is-info-view");
  additionalInfoPanel.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".product-info-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".product-info-tabs button").forEach((item) => item.classList.toggle("is-active", item === button));
    infoCopy.textContent = button.dataset.copy;
    openAdditionalInfo(button.textContent.trim());
  });
});
document.querySelector(".additional-info-close").addEventListener("click", closeAdditionalInfo);

function isMobileProductLayout() {
  return window.matchMedia("(max-width: 800px)").matches;
}

function openPurchaseSheet() {
  if (!isMobileProductLayout()) return;
  closeAdditionalInfo();
  sheetDim.hidden = false;
  requestAnimationFrame(() => sheetDim.classList.add("is-open"));
  purchasePanel.classList.add("is-open");
  purchasePanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("product-sheet-open");
}

function closePurchaseSheet() {
  if (!isMobileProductLayout()) return;
  purchasePanel.classList.remove("is-open", "is-info-view");
  purchasePanel.setAttribute("aria-hidden", "true");
  additionalInfoPanel.setAttribute("aria-hidden", "true");
  sheetDim.classList.remove("is-open");
  document.body.classList.remove("product-sheet-open");
  window.setTimeout(() => {
    if (!sheetDim.classList.contains("is-open")) sheetDim.hidden = true;
  }, 220);
}

document.querySelector(".mobile-buy-trigger").addEventListener("click", openPurchaseSheet);
sheetDim.addEventListener("click", closePurchaseSheet);
document.querySelector(".mobile-bookmark").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
});
document.querySelector(".mobile-share").addEventListener("click", async () => {
  if (!navigator.share) return;
  try {
    await navigator.share({ title: document.title, url: window.location.href });
  } catch (error) {
    // Closing the native share sheet is not an error for this interface.
  }
});

document.querySelector(".size-info-button").addEventListener("click", () => document.querySelector("#size-info").scrollIntoView({ behavior: "smooth" }));

const purchaseStatus = document.querySelector(".purchase-status");
document.querySelector(".add-to-bag").addEventListener("click", () => {
  if (!purchaseBottom.classList.contains("is-ready")) {
    purchaseStatus.textContent = "옵션을 선택해 주세요.";
    return;
  }
  purchaseStatus.textContent = `${quantity}개 상품을 장바구니에 담았습니다.`;
});
document.querySelector(".buy-now").addEventListener("click", () => {
  purchaseStatus.textContent = purchaseBottom.classList.contains("is-ready") ? "구매를 진행합니다." : "옵션을 선택해 주세요.";
});

const pairingViewport = document.querySelector(".pairing-viewport");
const pairingTrack = document.querySelector(".pairing-track");
const pairingCards = [...document.querySelectorAll(".pairing-card")];
const pairingPrev = document.querySelector(".pairing-prev");
const pairingNext = document.querySelector(".pairing-next");
const pairingCurrent = document.querySelector(".pairing-controls output b");
let pairingPage = 0;
let pairingDragStartX = 0;
let pairingDragOffset = 0;
let pairingDragDistance = 0;

function getPairingOverflow() {
  return Math.max(0, pairingTrack.scrollWidth - pairingViewport.clientWidth);
}

const productFooter = document.querySelector(".site-footer");
let purchasePanelScrollFrame = 0;

function updatePurchasePanelFooterLimit() {
  if (isMobileProductLayout()) {
    purchasePanel.style.removeProperty("--purchase-footer-shift");
    return;
  }

  const footerTop = productFooter.getBoundingClientRect().top;
  const fixedPanelBottom = 96 + purchasePanel.offsetHeight;
  const footerShift = Math.min(0, footerTop - fixedPanelBottom);
  purchasePanel.style.setProperty("--purchase-footer-shift", `${footerShift}px`);
}

function queuePurchasePanelFooterLimit() {
  if (purchasePanelScrollFrame) return;
  purchasePanelScrollFrame = requestAnimationFrame(() => {
    purchasePanelScrollFrame = 0;
    updatePurchasePanelFooterLimit();
  });
}

function updatePairingCarousel() {
  const overflow = getPairingOverflow();
  const maxPage = overflow > 0 ? 1 : 0;
  pairingPage = Math.min(pairingPage, maxPage);
  const offset = pairingPage === 1 ? overflow : 0;

  pairingTrack.style.transform = `translateX(${-offset}px)`;
  pairingCurrent.textContent = pairingPage + 1;
  pairingPrev.disabled = pairingPage === 0;
  pairingNext.disabled = pairingPage === maxPage;
  pairingPrev.querySelector("img").src = pairingPrev.disabled ? "assets/pairing-arrow-left-disabled.svg" : "assets/pairing-arrow-left.svg";
  pairingNext.querySelector("img").src = pairingNext.disabled ? "assets/pairing-arrow-right-disabled.svg" : "assets/pairing-arrow-right.svg";
  pairingCards.forEach((card, index) => card.classList.toggle("is-edge-preview", (pairingPage === 0 && index === pairingCards.length - 1) || (pairingPage === maxPage && pairingPage > 0 && index === 0)));
}

pairingPrev.addEventListener("click", () => {
  pairingPage = Math.max(0, pairingPage - 1);
  updatePairingCarousel();
});

pairingNext.addEventListener("click", () => {
  pairingPage = Math.min(1, pairingPage + 1);
  updatePairingCarousel();
});

pairingViewport.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || event.target.closest("button")) return;
  pairingDragStartX = event.clientX;
  pairingDragDistance = 0;
  pairingDragOffset = pairingPage === 1 ? getPairingOverflow() : 0;
  pairingViewport.classList.add("is-dragging");
  pairingViewport.setPointerCapture(event.pointerId);
});

pairingViewport.addEventListener("pointermove", (event) => {
  if (!pairingViewport.classList.contains("is-dragging")) return;
  pairingDragDistance = event.clientX - pairingDragStartX;
  const overflow = getPairingOverflow();
  const nextOffset = Math.min(overflow, Math.max(0, pairingDragOffset - pairingDragDistance));
  pairingTrack.style.transform = `translateX(${-nextOffset}px)`;
});

function finishPairingDrag(event) {
  if (!pairingViewport.classList.contains("is-dragging")) return;
  pairingViewport.classList.remove("is-dragging");
  if (pairingViewport.hasPointerCapture(event.pointerId)) pairingViewport.releasePointerCapture(event.pointerId);
  if (Math.abs(pairingDragDistance) > 42) pairingPage = pairingDragDistance < 0 ? 1 : 0;
  updatePairingCarousel();
}

pairingViewport.addEventListener("pointerup", finishPairingDrag);
pairingViewport.addEventListener("pointercancel", finishPairingDrag);

document.querySelectorAll(".wishlist-button").forEach((button) => {
  button.addEventListener("click", () => button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true")));
});

window.addEventListener("resize", () => {
  updatePairingCarousel();
  if (!isMobileProductLayout()) {
    purchasePanel.classList.remove("is-open");
    purchasePanel.setAttribute("aria-hidden", "false");
    sheetDim.hidden = true;
    sheetDim.classList.remove("is-open");
    document.body.classList.remove("product-sheet-open");
  } else if (!purchasePanel.classList.contains("is-open")) {
    purchasePanel.setAttribute("aria-hidden", "true");
  }
  updatePurchasePanelFooterLimit();
});
window.addEventListener("scroll", queuePurchasePanelFooterLimit, { passive: true });
updatePairingCarousel();
if (isMobileProductLayout()) purchasePanel.setAttribute("aria-hidden", "true");
updatePurchasePanelFooterLimit();
