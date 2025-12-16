async function generateBlog() {
  const prompt = document.getElementById("prompt").value;
  const output = document.getElementById("output");

  if (!prompt.trim()) {
    output.innerText = "⚠️ Please enter a topic.";
    return;
  }

  output.innerText = "⏳ Generating blog...";

  try {
    const response = await fetch("/api/generate-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Request failed");
    }

    const data = await response.json();

    console.log("API response:", data); // 🔍 DEBUG

    // 👇 EXACT key match
    output.innerText = data.blog;

  } catch (error) {
    console.error(error);
    output.innerText = "❌ Error generating blog.";
  }
}
