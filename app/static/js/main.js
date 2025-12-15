async function generateBlog() {
  const prompt = document.getElementById("prompt").value;
  const output = document.getElementById("output");

  if (!prompt.trim()) {
    output.innerText = "⚠️ Please enter a topic.";
    return;
  }

  output.innerText = "⏳ Generating blog...";

  const response = await fetch("/api/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();
  output.innerText = data.blog;
}
