import { useEffect } from "react"

import styles from './comments.module.scss'

export default function UtterancComment() {

  useEffect(() => {
    let script = document.createElement('script')
    let anchor = document.getElementById('inject-comments-for-uterances')
    script.setAttribute('src', 'https://utteranc.es/client.js')
    script.setAttribute('crossorigin', 'anonymous')
    script.setAttribute('async', 'async')
    script.setAttribute('repo', 'pablolucio97/ignite-react-js-space-travelling')
    script.setAttribute('issue-term', 'pathname')
    script.setAttribute('theme', 'github-dark')
    anchor.appendChild(script)
  }, [])

  return (
    <div id="inject-comments-for-uterances" className={styles.uterancesInjection}></div>
  )
}
