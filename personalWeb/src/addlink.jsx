import { useEffect, useState, memo } from "react";

export const AddLink = memo(({ addlink, setShowLink }) => {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("貼上超連結");
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowLink(false); // 呼叫外部傳進來的關閉函式
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // 清除監聽，避免 memory leak 或影響其他地方
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowLink]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!url) return;
    const pureURL = url.replaceAll(" ", "");
    const validURL =
      pureURL.startsWith("http://") || pureURL.startsWith("https://");
    if (!validURL) {
      setMessage("無效的連結");
      return;
    }
    addlink(pureURL);
    setShowLink(false);
  };
  return (
    <div className="prompt">
      <div className="prompt-windows">
        <label htmlFor="linkbox">{message}</label>
        <input
          id="linkbox"
          type="text"
          placeholder="e.g. https://example.com"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          autoFocus
          required
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSubmit}>確認</button>
          <button onClick={() => setShowLink(false)}>取消</button>
        </div>
      </div>
    </div>
  );
});
