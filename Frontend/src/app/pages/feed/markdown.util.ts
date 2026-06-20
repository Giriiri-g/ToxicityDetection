export function renderMarkdown(text: string): string {
  return text
    // Numbered list
    .replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    })
    // Bulletin
    .replace(/((?:^- .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(l => `<li>${l.replace(/^- /, '')}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/_(.*?)_/g, '<em>$1</em>') // Italic
    .replace(/\n/g, '<br>'); // new line (keep same format like pre tag)
}
