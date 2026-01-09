/* ============================
   Global Editor State
============================ */
let editorReady = false;

/* ============================
   Helper: Set Editor Content
============================ */
function setEditorData(html) {
  const editor = CKEDITOR.instances.editor;

  if (!editor) {
    console.error("❌ CKEditor instance not ready");
    return;
  }

  editor.setData(html);
}

/* ============================
   CKEditor Initialization
============================ */
window.addEventListener("load", function () {
  if (typeof CKEDITOR === "undefined") {
    console.error("❌ CKEditor not loaded");
    return;
  }

  // Inject Dark Mode Styles into Editor Iframe
  CKEDITOR.addCss(`
    body { 
      background-color: #000 !important; 
      color: #e0e0e0 !important; 
      font-family: 'Outfit', sans-serif !important;
      font-size: 18px;
      line-height: 1.8;
      padding: 20px;
    }
    p { margin-bottom: 1.5em; }
    a { color: #00ffa3 !important; text-decoration: underline; }
    h1, h2, h3, h4 { color: #fff !important; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2.2em; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
    h2 { font-size: 1.8em; }
    h3 { font-size: 1.4em; color: #00ffa3 !important; }
    blockquote { 
      border-left: 4px solid #b026ff; 
      background: rgba(176, 38, 255, 0.1);
      padding: 10px 20px; 
      margin: 1.5em 0;
      color: #ccc; 
      font-style: italic;
    }
    ul, ol { margin-left: 2em; margin-bottom: 1.5em; }
    li { margin-bottom: 0.5em; }
    hr { border: 0; border-top: 1px solid #333; margin: 2em 0; }
  `);

  CKEDITOR.replace("editor", {
    height: 500, // Increased height to match new UI
    uiColor: '#000000', // Dark UI base
    removePlugins: "elementspath",
    resize_enabled: false,
    toolbar: [
      { name: "basicstyles", items: ["Bold", "Italic", "Underline", "Strike"] },
      { name: "paragraph", items: ["NumberedList", "BulletedList", "Blockquote", "JustifyLeft", "JustifyCenter"] },
      { name: "links", items: ["Link", "Unlink"] },
      { name: "insert", items: ["Image", "Table", "HorizontalRule"] },
      { name: "styles", items: ["Format", "Font", "FontSize"] },
      { name: "colors", items: ["TextColor", "BGColor"] },
      { name: "tools", items: ["Maximize"] }
    ]
  });

  CKEDITOR.on("instanceReady", function (evt) {
    if (evt.editor.name === "editor") {
      editorReady = true;
      console.log("✅ CKEditor is ready");

      // Default content
      evt.editor.setData("<p>✨ Ready to generate amazing content...</p>");
    }
  });
});


/* ============================
   Generate Blog
============================ */
async function generateBlog() {
  const prompt = document.getElementById("prompt").value;
  const tone = document.getElementById("tone").value;
  const language = document.getElementById("language").value;

  if (!prompt.trim()) {
    alert("Please enter a blog topic");
    return;
  }

  if (!editorReady) {
    alert("Editor is still loading. Please try again.");
    return;
  }

  setEditorData("<p class='animate-pulse'>🔮 Consulting the AI oracles...</p>");

  try {
    const response = await fetch("/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        tone: tone,
        language: language
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to generate blog");
    }

    setEditorData(data.blog);

  } catch (error) {
    console.error(error);
    setEditorData("<p>❌ Error generating blog.</p>");
  }
}

/* ============================
   Fetch Images (Pexels Backend)
============================ */
async function fetchImages() {
  const topic = document.getElementById("prompt").value;
  const container = document.getElementById("imageResults");

  if (!topic.trim()) {
    alert("Enter a topic to fetch images");
    return;
  }

  container.innerHTML = "<p class='text-sm text-[#00ffa3] animate-pulse'>🔍 Scanning visual dimensions...</p>";

  try {
    const res = await fetch(`/api/images?query=${encodeURIComponent(topic)}`);
    const data = await res.json();

    container.innerHTML = "";

    if (!data.images || data.images.length === 0) {
      container.innerHTML = "<p class='text-sm text-zinc-500'>No visuals found in this timeline.</p>";
      return;
    }

    data.images.forEach(img => {
      // Create a stylish card for each image
      const wrapper = document.createElement("div");
      wrapper.className = "relative group cursor-pointer overflow-hidden rounded-lg border border-zinc-800 hover:border-[#00ffa3] transition-all duration-300";

      const imageEl = document.createElement("img");
      imageEl.src = img.thumbnail;
      imageEl.className = "w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110";
      imageEl.title = "Click to insert";

      const overlay = document.createElement("div");
      overlay.className = "absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300";
      overlay.innerHTML = "<span class='text-[#00ffa3] font-bold text-xs'>INSERT +</span>";

      wrapper.onclick = () => insertImageToEditor(img.original);

      wrapper.appendChild(imageEl);
      wrapper.appendChild(overlay);
      container.appendChild(wrapper);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p class='text-sm text-red-500'>System Failure: Visuals unavailable.</p>";
  }
}

/* ============================
   Insert Image into CKEditor
============================ */

function insertImageToEditor(imageUrl) {
  const editor = CKEDITOR.instances.editor;

  if (!editor) {
    console.error("❌ Editor not ready");
    return;
  }

  editor.insertHtml(`
    <figure>
      <img src="${imageUrl}" alt="Blog image" style="max-width:100%; height:auto;" />
    </figure>
  `);
}

function getSelectedText() {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return "";

  const selection = editor.getSelection();
  if (!selection) return "";

  const ranges = selection.getRanges();
  if (!ranges || ranges.length === 0) return "";

  const fragment = ranges[0].cloneContents();

  // Convert fragment to HTML
  const container = new CKEDITOR.dom.element("div");
  container.append(fragment);

  return container.getText().trim();
}


function replaceSelectedText(newHtml) {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return;

  editor.insertHtml(newHtml);
}


function showSelectionToolbar() {
  const editor = CKEDITOR.instances.editor;
  const toolbar = document.getElementById("selectionToolbar");

  if (!editor || !toolbar) return;

  const selectedText = getSelectedText();
  if (!selectedText) {
    toolbar.classList.add("hidden");
    return;
  }

  // Get editor container position
  const editorBox = editor.container.$.getBoundingClientRect();

  toolbar.style.top = editorBox.top + window.scrollY - 50 + "px";
  toolbar.style.left = editorBox.left + window.scrollX + 20 + "px";

  toolbar.classList.remove("hidden");
}

CKEDITOR.on("instanceReady", function (evt) {
  if (evt.editor.name === "editor") {
    editorReady = true;
    console.log("✅ CKEditor is ready");

    // 🔥 Listen to CKEditor selection changes
    evt.editor.on("selectionChange", function () {
      showSelectionToolbar();
    });

    evt.editor.on("blur", function () {
      document
        .getElementById("selectionToolbar")
        .classList.add("hidden");
    });
  }
});

async function regenerate(action) {
  const editor = CKEDITOR.instances.editor;
  if (!editor) return;

  console.log("🟢 Regenerate clicked:", action);

  const selection = editor.getSelection();
  if (!selection) return;

  const ranges = selection.getRanges();
  if (!ranges || ranges.length === 0) return;

  // ✅ SAVE selection
  savedRange = ranges[0];

  const selectedHtml = getSelectedHtml();
  if (!selectedHtml) return;

  // Temporary placeholder
  editor.insertHtml("<em>⏳ Regenerating...</em>");

  try {
    const res = await fetch("/api/regenerate-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: selectedHtml,
        action: action
      })
    });

    const data = await res.json();
    console.log("🟢 API response:", data);

    if (!res.ok) throw new Error(data.detail || "Failed");

    // ✅ RESTORE selection
    editor.getSelection().selectRanges([savedRange]);

    // ✅ Replace selection with AI output
    editor.insertHtml(data.result);

  } catch (err) {
    console.error(err);
    editor.insertHtml("<strong>❌ Failed</strong>");
  }
}

