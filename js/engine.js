// ushit - Aesthetic Minimalist Block Engine
// Core State & Logic

const StorageKey = "ushit_notebook_data";
const ThemeKey = "ushit_active_theme";

// Default Initial Workspace Seed
const DefaultData = {
  activePageId: "p_welcome",
  pages: [
    {
      id: "p_welcome",
      title: "Welcome to ushit",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [
        {
          id: "b_1",
          type: "h1",
          content: "Simplicity is the Ultimate Sophistication",
          properties: {}
        },
        {
          id: "b_2",
          type: "callout",
          content: "ushit is a distraction-free, aesthetic note-taking app inspired by the core block architecture of Notion, engineered for speed and clarity.",
          properties: {}
        },
        {
          id: "b_3",
          type: "h2",
          content: "How to use",
          properties: {}
        },
        {
          id: "b_4",
          type: "bullet",
          content: "Type / anywhere to open the command menu (Headers, Lists, Code, Quotes).",
          properties: {}
        },
        {
          id: "b_5",
          type: "bullet",
          content: "Press Enter to create a new block below.",
          properties: {}
        },
        {
          id: "b_6",
          type: "bullet",
          content: "Press Backspace on an empty block to convert or remove it.",
          properties: {}
        },
        {
          id: "b_7",
          type: "h2",
          content: "Tasks for today",
          properties: {}
        },
        {
          id: "b_8",
          type: "todo",
          content: "Reverse engineer Notion's block model",
          properties: { checked: true }
        },
        {
          id: "b_9",
          type: "todo",
          content: "Build aesthetic minimal UI without clutter",
          properties: { checked: true }
        },
        {
          id: "b_10",
          type: "todo",
          content: "Compile ushit.apk via GitHub Actions CI/CD",
          properties: { checked: false }
        },
        {
          id: "b_11",
          type: "divider",
          content: "",
          properties: {}
        },
        {
          id: "b_12",
          type: "quote",
          content: "“Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.” — Antoine de Saint-Exupéry",
          properties: {}
        }
      ]
    }
  ]
};

class NotebookApp {
  constructor() {
    this.data = this.loadData();
    this.activeBlockIndex = null;
    this.slashMenuIndex = 0;
    this.saveTimeout = null;

    this.slashCommands = [
      { type: "text", title: "Text", desc: "Plain text paragraph", icon: Icons.text },
      { type: "h1", title: "Heading 1", desc: "Large section title", icon: Icons.h1 },
      { type: "h2", title: "Heading 2", desc: "Medium subsection title", icon: Icons.h2 },
      { type: "h3", title: "Heading 3", desc: "Small sub-heading", icon: Icons.h3 },
      { type: "todo", title: "To-do List", desc: "Task tracking checkbox", icon: Icons.todo },
      { type: "bullet", title: "Bulleted List", desc: "Clean bullet points", icon: Icons.bullet },
      { type: "quote", title: "Quote", desc: "Distinguished callout quote", icon: Icons.quote },
      { type: "callout", title: "Callout Box", desc: "Highlighted card note", icon: Icons.callout },
      { type: "code", title: "Code Snippet", desc: "Monospace code block", icon: Icons.code },
      { type: "divider", title: "Divider", desc: "Subtle separator line", icon: Icons.divider }
    ];

    this.initTheme();
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(StorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Storage load fallback:", e);
    }
    return JSON.parse(JSON.stringify(DefaultData));
  }

  saveData() {
    this.showSaveStatus("Saving...");
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(StorageKey, JSON.stringify(this.data));
        this.showSaveStatus("Saved", true);
      } catch (e) {
        console.error("Failed to save:", e);
        this.showSaveStatus("Error", false);
      }
    }, 350);
  }

  showSaveStatus(text, ok = null) {
    if (!this.dom.saveStatus) return;
    this.dom.saveStatus.textContent = text;
    if (ok === true) {
      this.dom.saveStatus.classList.add("saved");
    } else {
      this.dom.saveStatus.classList.remove("saved");
    }
  }

  initTheme() {
    const saved = localStorage.getItem(ThemeKey) || "dark";
    document.documentElement.setAttribute("data-theme", saved);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(ThemeKey, next);
    this.updateThemeIcon(next);
  }

  updateThemeIcon(theme) {
    if (this.dom.themeToggleBtn) {
      this.dom.themeToggleBtn.innerHTML = theme === "dark" ? Icons.sun : Icons.moon;
    }
  }

  cacheDOM() {
    this.dom = {
      app: document.getElementById("app"),
      sidebar: document.getElementById("sidebar"),
      sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
      sidebarBackdrop: document.getElementById("sidebarBackdrop"),
      newPageBtn: document.getElementById("newPageBtn"),
      pagesList: document.getElementById("pagesList"),
      searchInput: document.getElementById("searchInput"),
      themeToggleBtn: document.getElementById("themeToggleBtn"),
      exportModalBtn: document.getElementById("exportModalBtn"),
      pageBreadcrumb: document.getElementById("pageBreadcrumb"),
      saveStatus: document.getElementById("saveStatus"),
      docTitleInput: document.getElementById("docTitleInput"),
      blocksList: document.getElementById("blocksList"),
      slashMenu: document.getElementById("slashMenu"),
      slashMenuItems: document.getElementById("slashMenuItems"),
      mobileToolbar: document.getElementById("mobileToolbar"),
      modalOverlay: document.getElementById("modalOverlay"),
      modalCloseBtn: document.getElementById("modalCloseBtn"),
      exportMarkdownBtn: document.getElementById("exportMarkdownBtn"),
      exportJsonBtn: document.getElementById("exportJsonBtn"),
      importJsonInput: document.getElementById("importJsonInput")
    };
  }

  bindEvents() {
    // Theme toggle
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    this.updateThemeIcon(currentTheme);
    this.dom.themeToggleBtn.addEventListener("click", () => this.toggleTheme());

    // Sidebar open/close
    this.dom.sidebarToggleBtn.addEventListener("click", () => {
      this.dom.sidebar.classList.toggle("open");
    });
    this.dom.sidebarBackdrop.addEventListener("click", () => {
      this.dom.sidebar.classList.remove("open");
    });

    // New Page
    this.dom.newPageBtn.addEventListener("click", () => this.createPage());

    // Search
    this.dom.searchInput.addEventListener("input", (e) => this.filterPages(e.target.value));

    // Page Title Change
    this.dom.docTitleInput.addEventListener("input", (e) => {
      const page = this.getActivePage();
      if (page) {
        page.title = e.target.value || "Untitled";
        page.updatedAt = Date.now();
        this.dom.pageBreadcrumb.textContent = page.title;
        this.renderPagesList();
        this.saveData();
      }
    });

    // Modal
    this.dom.exportModalBtn.addEventListener("click", () => this.openModal());
    this.dom.modalCloseBtn.addEventListener("click", () => this.closeModal());
    this.dom.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.dom.modalOverlay) this.closeModal();
    });

    // Export & Import
    this.dom.exportMarkdownBtn.addEventListener("click", () => this.exportMarkdown());
    this.dom.exportJsonBtn.addEventListener("click", () => this.exportJson());
    this.dom.importJsonInput.addEventListener("change", (e) => this.importJson(e));

    // Keyboard Shortcuts for Document
    document.addEventListener("keydown", (e) => this.handleGlobalKeyDown(e));

    // Mobile Quick Toolbar Actions
    this.dom.mobileToolbar.querySelectorAll("[data-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-type");
        this.convertActiveBlock(type);
      });
    });

    // Click outside slash menu closes it
    document.addEventListener("click", (e) => {
      if (!this.dom.slashMenu.contains(e.target)) {
        this.closeSlashMenu();
      }
    });
  }

  getActivePage() {
    return this.data.pages.find((p) => p.id === this.data.activePageId) || this.data.pages[0];
  }

  createPage() {
    const id = "p_" + Date.now().toString(36);
    const newPage = {
      id,
      title: "Untitled Page",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [
        {
          id: "b_" + Date.now().toString(36),
          type: "text",
          content: "",
          properties: {}
        }
      ]
    };
    this.data.pages.unshift(newPage);
    this.data.activePageId = id;
    this.saveData();
    this.render();
    this.dom.sidebar.classList.remove("open");

    setTimeout(() => {
      this.dom.docTitleInput.focus();
      this.dom.docTitleInput.select();
    }, 50);
  }

  deletePage(pageId, event) {
    event.stopPropagation();
    if (this.data.pages.length <= 1) {
      alert("At least one page must remain in your notebook.");
      return;
    }
    if (!confirm("Are you sure you want to delete this page?")) return;

    this.data.pages = this.data.pages.filter((p) => p.id !== pageId);
    if (this.data.activePageId === pageId) {
      this.data.activePageId = this.data.pages[0].id;
    }
    this.saveData();
    this.render();
  }

  selectPage(pageId) {
    this.data.activePageId = pageId;
    this.saveData();
    this.render();
    this.dom.sidebar.classList.remove("open");
  }

  filterPages(query) {
    const q = query.trim().toLowerCase();
    const items = this.dom.pagesList.querySelectorAll(".page-item");
    items.forEach((item) => {
      const title = item.querySelector(".page-item-title").textContent.toLowerCase();
      item.style.display = title.includes(q) ? "flex" : "none";
    });
  }

  render() {
    this.renderPagesList();
    this.renderDocument();
  }

  renderPagesList() {
    const activePage = this.getActivePage();
    this.dom.pagesList.innerHTML = "";

    this.data.pages.forEach((page) => {
      const item = document.createElement("div");
      item.className = `page-item ${page.id === activePage.id ? "active" : ""}`;
      item.innerHTML = `
        <div class="page-item-info">
          ${Icons.page}
          <span class="page-item-title">${this.escapeHtml(page.title || "Untitled")}</span>
        </div>
        <button class="icon-btn page-item-delete" title="Delete page">
          ${Icons.trash}
        </button>
      `;

      item.addEventListener("click", () => this.selectPage(page.id));
      item.querySelector(".page-item-delete").addEventListener("click", (e) => this.deletePage(page.id, e));
      this.dom.pagesList.appendChild(item);
    });
  }

  renderDocument() {
    const page = this.getActivePage();
    if (!page) return;

    this.dom.docTitleInput.value = page.title || "";
    this.dom.pageBreadcrumb.textContent = page.title || "Untitled";

    if (!page.blocks || page.blocks.length === 0) {
      page.blocks = [{ id: "b_" + Date.now().toString(36), type: "text", content: "", properties: {} }];
    }

    this.dom.blocksList.innerHTML = "";
    page.blocks.forEach((block, index) => {
      const el = this.createBlockElement(block, index);
      this.dom.blocksList.appendChild(el);
    });
  }

  createBlockElement(block, index) {
    const row = document.createElement("div");
    row.className = "block-row";
    row.setAttribute("data-type", block.type);
    row.setAttribute("data-index", index);
    row.setAttribute("data-id", block.id);

    if (block.type === "todo" && block.properties?.checked) {
      row.classList.add("checked");
    }

    let prefixHtml = "";
    if (block.type === "todo") {
      const checkedAttr = block.properties?.checked ? "checked" : "";
      prefixHtml = `<input type="checkbox" class="todo-checkbox" ${checkedAttr} />`;
    } else if (block.type === "bullet") {
      prefixHtml = `<div class="bullet-dot"></div>`;
    } else if (block.type === "callout") {
      prefixHtml = `<div class="callout-icon">${Icons.callout}</div>`;
    }

    let contentHtml = "";
    if (block.type === "divider") {
      contentHtml = `<div class="divider-line"></div>`;
    } else {
      contentHtml = `
        <div class="block-content" contenteditable="true" data-placeholder="Type '/' for commands...">${this.escapeHtml(block.content || "")}</div>
      `;
    }

    row.innerHTML = `
      <div class="block-handle" title="Block options">${Icons.drag}</div>
      ${prefixHtml}
      ${contentHtml}
    `;

    // Checkbox toggle
    if (block.type === "todo") {
      const cb = row.querySelector(".todo-checkbox");
      cb.addEventListener("change", (e) => {
        block.properties = block.properties || {};
        block.properties.checked = e.target.checked;
        if (e.target.checked) {
          row.classList.add("checked");
        } else {
          row.classList.remove("checked");
        }
        this.saveData();
      });
    }

    // Editable text events
    const content = row.querySelector(".block-content");
    if (content) {
      content.addEventListener("focus", () => {
        this.activeBlockIndex = index;
      });

      content.addEventListener("input", (e) => {
        block.content = content.innerText;
        this.checkSlashTrigger(content, row, index);
        this.saveData();
      });

      content.addEventListener("keydown", (e) => {
        this.handleBlockKeyDown(e, index, block, content);
      });
    }

    return row;
  }

  checkSlashTrigger(contentEl, rowEl, index) {
    const text = contentEl.innerText;
    if (text === "/" || text.startsWith("/")) {
      const query = text.slice(1).toLowerCase();
      this.openSlashMenu(rowEl, query);
    } else {
      this.closeSlashMenu();
    }
  }

  openSlashMenu(targetRow, query = "") {
    const rect = targetRow.getBoundingClientRect();
    const menu = this.dom.slashMenu;
    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${Math.min(rect.left + window.scrollX + 20, window.innerWidth - 280)}px`;

    const filtered = this.slashCommands.filter((cmd) =>
      cmd.title.toLowerCase().includes(query) || cmd.type.toLowerCase().includes(query)
    );

    this.slashMenuIndex = 0;
    this.renderSlashItems(filtered);
    menu.classList.add("active");
  }

  renderSlashItems(commands) {
    this.currentFilteredCommands = commands;
    this.dom.slashMenuItems.innerHTML = "";

    if (commands.length === 0) {
      this.dom.slashMenuItems.innerHTML = `<div style="padding:10px;font-size:12px;color:var(--fg-muted)">No matching commands</div>`;
      return;
    }

    commands.forEach((cmd, i) => {
      const item = document.createElement("div");
      item.className = `slash-item ${i === this.slashMenuIndex ? "selected" : ""}`;
      item.innerHTML = `
        <div class="slash-item-icon">${cmd.icon}</div>
        <div>
          <div style="font-weight:500;">${cmd.title}</div>
          <div class="slash-item-desc">${cmd.desc}</div>
        </div>
      `;
      item.addEventListener("click", () => {
        this.applySlashCommand(cmd.type);
      });
      this.dom.slashMenuItems.appendChild(item);
    });
  }

  closeSlashMenu() {
    this.dom.slashMenu.classList.remove("active");
  }

  applySlashCommand(type) {
    if (this.activeBlockIndex === null) return;
    const page = this.getActivePage();
    const block = page.blocks[this.activeBlockIndex];
    if (!block) return;

    block.type = type;
    block.content = ""; // clear the '/' command character
    this.closeSlashMenu();
    this.saveData();
    this.renderDocument();

    setTimeout(() => {
      this.focusBlock(this.activeBlockIndex);
    }, 20);
  }

  convertActiveBlock(type) {
    if (this.activeBlockIndex === null) {
      this.activeBlockIndex = 0;
    }
    this.applySlashCommand(type);
  }

  handleBlockKeyDown(e, index, block, contentEl) {
    const page = this.getActivePage();

    // If slash menu is open, capture Arrow keys and Enter
    if (this.dom.slashMenu.classList.contains("active")) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.slashMenuIndex = (this.slashMenuIndex + 1) % (this.currentFilteredCommands.length || 1);
        this.renderSlashItems(this.currentFilteredCommands);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.slashMenuIndex = (this.slashMenuIndex - 1 + this.currentFilteredCommands.length) % (this.currentFilteredCommands.length || 1);
        this.renderSlashItems(this.currentFilteredCommands);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (this.currentFilteredCommands && this.currentFilteredCommands[this.slashMenuIndex]) {
          this.applySlashCommand(this.currentFilteredCommands[this.slashMenuIndex].type);
        }
        return;
      }
      if (e.key === "Escape") {
        this.closeSlashMenu();
        return;
      }
    }

    // Normal Enter -> Create next block
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newBlock = {
        id: "b_" + Date.now().toString(36),
        type: block.type === "todo" || block.type === "bullet" ? block.type : "text",
        content: "",
        properties: {}
      };
      page.blocks.splice(index + 1, 0, newBlock);
      this.saveData();
      this.renderDocument();
      setTimeout(() => {
        this.focusBlock(index + 1);
      }, 20);
      return;
    }

    // Backspace on empty block -> convert or remove
    if (e.key === "Backspace") {
      const selection = window.getSelection();
      const atStart = selection.anchorOffset === 0 && selection.focusOffset === 0;

      if (atStart && contentEl.innerText.trim() === "") {
        e.preventDefault();
        if (block.type !== "text") {
          // Mutate back to normal text first
          block.type = "text";
          this.saveData();
          this.renderDocument();
          setTimeout(() => this.focusBlock(index), 20);
        } else if (page.blocks.length > 1) {
          // Delete block and focus previous
          page.blocks.splice(index, 1);
          this.saveData();
          this.renderDocument();
          setTimeout(() => this.focusBlock(Math.max(0, index - 1)), 20);
        }
        return;
      }
    }

    // Arrow navigation between blocks
    if (e.key === "ArrowUp" && index > 0) {
      const selection = window.getSelection();
      if (selection.anchorOffset === 0) {
        e.preventDefault();
        this.focusBlock(index - 1);
      }
    }
    if (e.key === "ArrowDown" && index < page.blocks.length - 1) {
      const selection = window.getSelection();
      if (selection.anchorOffset === contentEl.innerText.length) {
        e.preventDefault();
        this.focusBlock(index + 1);
      }
    }
  }

  handleGlobalKeyDown(e) {
    // Quick shortcut: Cmd/Ctrl + N for new page
    if ((e.metaKey || e.ctrlKey) && e.key === "n") {
      e.preventDefault();
      this.createPage();
    }
  }

  focusBlock(index) {
    const rows = this.dom.blocksList.querySelectorAll(".block-row");
    if (rows[index]) {
      const content = rows[index].querySelector(".block-content");
      if (content) {
        content.focus();
        this.activeBlockIndex = index;
      }
    }
  }

  openModal() {
    this.dom.modalOverlay.classList.add("active");
  }

  closeModal() {
    this.dom.modalOverlay.classList.remove("active");
  }

  exportMarkdown() {
    const page = this.getActivePage();
    if (!page) return;

    let md = `# ${page.title || "Untitled"}\n\n`;
    page.blocks.forEach((b) => {
      switch (b.type) {
        case "h1":
          md += `# ${b.content}\n\n`;
          break;
        case "h2":
          md += `## ${b.content}\n\n`;
          break;
        case "h3":
          md += `### ${b.content}\n\n`;
          break;
        case "todo":
          md += `- [${b.properties?.checked ? "x" : " "}] ${b.content}\n`;
          break;
        case "bullet":
          md += `- ${b.content}\n`;
          break;
        case "quote":
          md += `> ${b.content}\n\n`;
          break;
        case "callout":
          md += `> **Note:** ${b.content}\n\n`;
          break;
        case "code":
          md += `\`\`\`\n${b.content}\n\`\`\`\n\n`;
          break;
        case "divider":
          md += `---\n\n`;
          break;
        default:
          md += `${b.content}\n\n`;
      }
    });

    this.downloadFile(`${page.title || "page"}.md`, md, "text/markdown");
  }

  exportJson() {
    const dataStr = JSON.stringify(this.data, null, 2);
    this.downloadFile(`ushit-backup-${new Date().toISOString().slice(0, 10)}.json`, dataStr, "application/json");
  }

  importJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.pages && Array.isArray(parsed.pages)) {
          this.data = parsed;
          this.saveData();
          this.render();
          this.closeModal();
          alert("Notebook imported successfully!");
        } else {
          alert("Invalid backup format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  }

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Bootstrapping
window.addEventListener("DOMContentLoaded", () => {
  window.ushit = new NotebookApp();
});
