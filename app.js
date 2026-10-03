(() => {
  "use strict";

  const data = window.ODIN_DATA;
  const plansGrid = document.querySelector("#plans-grid");
  const comparisonHead = document.querySelector("#comparison-head");
  const comparisonBody = document.querySelector("#comparison-body");
  const stepsGrid = document.querySelector("#steps-grid");
  const faqList = document.querySelector("#faq-list");
  const dialog = document.querySelector("#order-dialog");
  const orderForm = document.querySelector("#order-form");
  const hostingSelect = document.querySelector("#hosting-select");
  const errorBox = document.querySelector("#form-error");
  const money = (amount) => `${amount.toLocaleString("en-US")} $`;
  const checkIcon = '<span class="included" aria-label="مشمول">✓</span>';

  function renderPlans() {
    plansGrid.innerHTML = data.packages.map((plan, index) => {
      const defaultHosting = plan.hosting[0];
      const firstYearRange = plan.hosting.length > 1
        ? `${money(plan.price + defaultHosting.annual)} <small>– ${money(plan.price + plan.hosting[plan.hosting.length - 1].annual)}</small>`
        : money(plan.price + defaultHosting.annual);
      return `
        <article class="plan-card${plan.popular ? " plan-featured" : ""}">
          ${plan.badge ? `<div class="plan-ribbon">${plan.badge}</div>` : ""}
          <div class="plan-topline"><span class="plan-number">0${index + 1}</span><span class="plan-audience">${plan.audience}</span></div>
          <h3>${plan.name}</h3>
          <p class="plan-description">${plan.description}</p>
          <div class="price-block"><strong>${money(plan.price)}</strong><span>${plan.payment} <i>·</i> سعر الباقة</span></div>
          <div class="plan-divider"></div>
          <p class="features-title">ماذا تتضمن الباقة؟</p>
          <ul class="feature-list">${plan.features.map((feature) => `<li><span class="feature-check">✓</span>${feature}</li>`).join("")}</ul>
          <div class="hosting-preview"><span>الاستضافة السنوية</span><b>${plan.hosting.length === 1 ? `${plan.hosting[0].name} · ${money(plan.hosting[0].annual)}` : `${money(plan.hosting[0].annual)} – ${money(plan.hosting[1].annual)}`}</b></div>
          <div class="year-total"><span>السنة الأولى مع الاستضافة</span><b>${firstYearRange}</b></div>
          <button class="button ${plan.popular ? "button-primary" : "button-card"} choose-plan" type="button" data-plan="${plan.id}">اختر ${index === 0 ? "الباقة الأولى" : index === 1 ? "الباقة الثانية" : "الباقة الثالثة"} <span>←</span></button>
          <small class="plan-price-foot">السنة الأولى: ${plan.hosting.length > 1 ? `${money(plan.price + plan.hosting[0].annual)} مع المشتركة أو ${money(plan.price + plan.hosting[1].annual)} مع الخاصة` : `${money(plan.price + defaultHosting.annual)} إجمالي`}</small>
        </article>`;
    }).join("");
    plansGrid.querySelectorAll(".choose-plan").forEach((button) => button.addEventListener("click", () => openOrder(button.dataset.plan)));
  }

  function renderComparison() {
    comparisonHead.innerHTML = `<th scope="col">المزايا</th>${data.packages.map((plan) => `
      <th scope="col"${plan.popular ? ' class="compare-featured"' : ""}>${plan.name}${plan.popular ? "<span>الأكثر اختياراً</span>" : ""}</th>`).join("")}`;
    comparisonBody.innerHTML = data.comparisonRows.map((row) => `
      <tr><th scope="row">${row.label}</th>${row.values.map((value, index) => {
        const className = index === 1 ? ' class="compare-featured"' : "";
        if (value === true) return `<td${className}>${checkIcon}</td>`;
        if (value === false) return `<td${className}><span class="not-included" aria-label="غير مشمول">—</span></td>`;
        return `<td${className}>${value}</td>`;
      }).join("")}</tr>`).join("");
  }

  function renderSteps() {
    const icons = ["⌕", "◉", "♧", "⚙", "♙", "↗"];
    stepsGrid.innerHTML = data.steps.map((step, index) => `
      <article class="step-card"><span class="step-number">0${index + 1}</span><div class="step-icon">${icons[index]}</div><p>${step}</p>${index < data.steps.length - 1 ? '<span class="step-arrow" aria-hidden="true">←</span>' : ""}</article>`).join("");
  }

  function renderFaqs() {
    faqList.innerHTML = data.faqs.map((item, index) => `
      <details class="faq-item"${index === 0 ? " open" : ""}><summary>${item.question}<span class="faq-plus" aria-hidden="true"></span></summary><p>${item.answer}</p></details>`).join("");
    faqList.querySelectorAll(".faq-item").forEach((item) => item.addEventListener("toggle", () => {
      if (item.open) faqList.querySelectorAll(".faq-item").forEach((other) => { if (other !== item) other.open = false; });
    }));
  }

  function selectedPlan() {
    return data.packages.find((plan) => plan.id === document.querySelector("#selected-plan").value);
  }

  function selectedHosting(plan) {
    return plan.hosting.find((hosting) => hosting.id === hostingSelect.value) || plan.hosting[0];
  }

  function renderSummary() {
    const plan = selectedPlan();
    if (!plan) return;
    const hosting = selectedHosting(plan);
    const total = plan.price + hosting.annual;
    document.querySelector("#order-summary").innerHTML = `
      <div><span>الباقة المختارة</span><b>${plan.arabicName}</b></div>
      <div><span>سعر الباقة</span><b>${money(plan.price)} <small>${plan.payment}</small></b></div>
      <div><span>الاستضافة</span><b>${hosting.name} · ${money(hosting.annual)} سنوياً</b></div>
      <div class="summary-total"><span>إجمالي السنة الأولى</span><b>${money(total)}</b></div>`;
  }

  function openOrder(planId) {
    const plan = data.packages.find((item) => item.id === planId);
    if (!plan) return;
    document.querySelector("#selected-plan").value = plan.id;
    hostingSelect.innerHTML = plan.hosting.map((hosting) => `<option value="${hosting.id}">${hosting.name}${hosting.detail ? ` (${hosting.detail})` : ""} — ${money(hosting.annual)} سنوياً</option>`).join("");
    const hostingField = document.querySelector("#hosting-field");
    hostingField.hidden = plan.hosting.length === 1;
    hostingSelect.required = plan.hosting.length > 1;
    document.querySelector("#order-summary").dataset.plan = plan.id;
    orderForm.reset();
    document.querySelector("#selected-plan").value = plan.id;
    hostingSelect.value = plan.hosting[0].id;
    errorBox.hidden = true;
    renderSummary();
    dialog.showModal();
    dialog.querySelector("input[name='customerName']").focus();
  }

  hostingSelect.addEventListener("change", renderSummary);
  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(orderForm).entries());
    const requiredFields = ["customerName", "companyName", "phone", "city"];
    const missing = requiredFields.some((key) => !String(fields[key] || "").trim());
    if (missing || !orderForm.reportValidity()) {
      errorBox.textContent = "يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.";
      errorBox.hidden = false;
      orderForm.querySelector(":invalid")?.focus();
      return;
    }
    const plan = selectedPlan();
    const hosting = selectedHosting(plan);
    const message = [
      "مرحباً فريق ODIN، أرغب بالاستفسار والاشتراك في إحدى باقات Odoo ERP.",
      "",
      `الباقة: ${plan.arabicName}`,
      `سعر الباقة: ${money(plan.price)} (${plan.payment})`,
      `الاستضافة: ${hosting.name} — ${money(hosting.annual)} سنوياً`,
      `التكلفة الإجمالية للسنة الأولى: ${money(plan.price + hosting.annual)}`,
      "",
      `اسم العميل: ${fields.customerName.trim()}`,
      `اسم الشركة: ${fields.companyName.trim()}`,
      `رقم الهاتف: ${fields.phone.trim()}`,
      `المدينة: ${fields.city.trim()}`,
      `الاحتياجات الإضافية: ${String(fields.notes || "").trim() || "لا يوجد"}`,
      "",
      "يرجى التواصل معي لتوضيح خطوات الاشتراك والتركيب والتدريب."
    ].join("\n");
    window.open(`https://wa.me/${data.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    dialog.close();
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    mainNav.classList.toggle("nav-open", !expanded);
  });
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("nav-open");
  }));

  renderPlans();
  renderComparison();
  renderSteps();
  renderFaqs();
  document.querySelector("#current-year").textContent = new Date().getFullYear();
})();
