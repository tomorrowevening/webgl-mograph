type NavButtonProps = {
  title: string
}

export default function NavButton(props: NavButtonProps) {
  return props.title.search('<') > -1 ? (
    <button className="svg" dangerouslySetInnerHTML={{ __html: props.title }}></button>
  ) : (
    <button>{props.title}</button>
  )
}
