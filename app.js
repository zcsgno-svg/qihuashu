export const FINANCIAL_SCENARIOS = {
  conservative: {
    label: "保守",
    summary: "单城谨慎验证，渠道转化低于预期，以控制固定成本和保证交付质量为优先。",
    years: [
      { revenue: 180, margin: 42, recurring: 15, result: "小规模验证" },
      { revenue: 480, margin: 49, recurring: 27, result: "接近盈亏平衡" },
      { revenue: 1080, margin: 55, recurring: 38, result: "形成经营利润" },
    ],
  },
  base: {
    label: "基准",
    summary: "单城验证10个付费客户，诊断向整改与运维逐层转化，第二年复制伙伴渠道。",
    years: [
      { revenue: 260, margin: 48, recurring: 20, result: "验证期亏损" },
      { revenue: 780, margin: 55, recurring: 35, result: "实现盈亏平衡" },
      { revenue: 1800, margin: 60, recurring: 45, result: "形成规模利润" },
    ],
  },
  growth: {
    label: "增长",
    summary: "产业伙伴导入效率高于基准，第二年提前开放伙伴协同，区域复制速度加快。",
    years: [
      { revenue: 340, margin: 50, recurring: 22, result: "完成模式验证" },
      { revenue: 1120, margin: 58, recurring: 38, result: "加速伙伴复制" },
      { revenue: 2800, margin: 63, recurring: 50, result: "形成区域网络" },
    ],
  },
};

export function formatRevenue(value) {
  return `${new Intl.NumberFormat("zh-CN").format(value)}万元`;
}

export function getChartHeights(revenues) {
  const max = Math.max(...revenues);
  if (max <= 0) {
    return revenues.map(() => 14);
  }

  return revenues.map((value) => {
    if (value <= 0) return 14;
    return Math.max(20, Math.round(92 * Math.pow(value / max, 0.9)));
  });
}

function updateFinancialScenario(name) {
  const scenario = FINANCIAL_SCENARIOS[name];
  if (!scenario) return;

  const rows = document.querySelectorAll("[data-financial-row]");
  const bars = document.querySelectorAll("[data-chart-bar]");
  const chartLabels = document.querySelectorAll("[data-chart-revenue]");
  const heights = getChartHeights(scenario.years.map((year) => year.revenue));

  scenario.years.forEach((year, index) => {
    const row = rows[index];
    if (row) {
      row.querySelector('[data-finance="revenue"]').textContent = formatRevenue(year.revenue);
      row.querySelector('[data-finance="margin"]').textContent = `${year.margin}%`;
      row.querySelector('[data-finance="recurring"]').textContent = `${year.recurring}%`;
      row.querySelector('[data-finance="result"]').textContent = year.result;
    }

    if (bars[index]) {
      bars[index].style.height = `${heights[index]}%`;
    }

    if (chartLabels[index]) {
      chartLabels[index].textContent = new Intl.NumberFormat("zh-CN").format(year.revenue);
    }
  });

  const summary = document.querySelector("[data-scenario-summary]");
  if (summary) summary.textContent = scenario.summary;

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    const selected = button.dataset.scenario === name;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });
}

function setView(name, updateHash = true) {
  const view = name === "customer" ? "customer" : "investor";

  document.querySelectorAll("[data-view]").forEach((element) => {
    const active = element.dataset.view === view;
    element.hidden = !active;
    element.classList.toggle("is-active", active);
  });

  document.querySelectorAll("[data-view-target]").forEach((button) => {
    const active = button.dataset.viewTarget === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  document.body.dataset.activeView = view;
  if (updateHash) {
    history.replaceState(null, "", view === "customer" ? "#customer" : "#investor");
  }

  requestAnimationFrame(() => {
    document.querySelectorAll(`[data-view="${view}"] .reveal`).forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        element.classList.add("is-visible");
      }
    });
  });
}

function initializeRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px" },
  );

  elements.forEach((element) => observer.observe(element));
}

function initializeApp() {
  document.querySelectorAll("[data-view-target]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.viewTarget);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => updateFinancialScenario(button.dataset.scenario));
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });

  document.querySelectorAll("[data-smart-link]").forEach((link) => {
    link.addEventListener("click", () => {
      if (document.body.dataset.activeView === "customer") {
        history.replaceState(null, "", "#contact");
      }
    });
  });

  const initialView = window.location.hash === "#customer" ? "customer" : "investor";
  setView(initialView, false);
  updateFinancialScenario("base");
  initializeRevealAnimations();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
  } else {
    initializeApp();
  }
}
