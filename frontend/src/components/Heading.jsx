// "Available Movies" -> the last word is crimson, like the rest of the theme.
export default function Heading({ children, as: Tag = 'h1' }) {
  const words = String(children).split(' ');
  const last = words.pop();
  return <Tag className="heading">{words.length ? `${words.join(' ')} ` : ''}<span>{last}</span></Tag>;
}
