import { bem } from 'src/corelib/bem'
import styles from './PageMainExtras.module.scss'

const cssPageMainExtrasAbout = bem(styles, 'PageMainExtrasAbout')
const PageMainExtrasAbout = () => {
  return (
    <div className={cssPageMainExtrasAbout()}>
      <div className={cssPageMainExtrasAbout('row')}>
        <div>Commit SHA:</div>
        <div>{import.meta.env.VITE_COMMIT_SHA}</div>
      </div>
      <div className={cssPageMainExtrasAbout('row')}>
        <div>Commit SHA (short):</div>
        <div>{import.meta.env.VITE_COMMIT_SHA_SHORT}</div>
      </div>
      <div className={cssPageMainExtrasAbout('row')}>
        <div>Build time:</div>
        <div>{import.meta.env.VITE_BUILD_TIME}</div>
      </div>
    </div>
  )
}

const css = bem(styles, 'PageMainExtras')
export const PageMainExtras = () => {
  return (
    <div className={css()}>
      <PageMainExtrasAbout />
    </div>
  )
}
