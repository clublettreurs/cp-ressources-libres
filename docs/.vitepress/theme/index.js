import DefaultTheme from 'vitepress/theme'
import MesureLongueur from '../components/MesureLongueur.vue'
import HomePage from '../components/HomePage.vue'
import GrandeursMesuresPage from '../components/GrandeursMesuresPage.vue'
import EcriturePage from '../components/EcriturePage.vue'
import EcritureLettre from '../components/EcritureLettre.vue'
import EcritureMot from '../components/EcritureMot.vue'
import ExerciseLayout from './ExerciseLayout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('MesureLongueur', MesureLongueur)
    app.component('HomePage', HomePage)
    app.component('GrandeursMesuresPage', GrandeursMesuresPage)
    app.component('EcriturePage', EcriturePage)
    app.component('EcritureLettre', EcritureLettre)
    app.component('EcritureMot', EcritureMot)
    app.component('ExerciseLayout', ExerciseLayout)
  }
}
