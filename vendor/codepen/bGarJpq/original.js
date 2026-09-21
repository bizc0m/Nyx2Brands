const app = Vue.createApp({
  data: () => ({
    infoModal: false,
    creditsModal: false,
    loginModal: false,
    uiModal: false,
  })
})

app.component('win-button', {
  template: '#win-button',
  
  props: {
    highlight: {
      type: Boolean,
      default: false,
    },
  },
})

app.component('win-window', {
  template: '#win-window',

  props: {
    title: {
      type: String,
      default: 'Title Missing',
    },
    supports: {
      type: String,
      default: 'mMc',
    },
    icon: {
      type: String,
      default: 'help_sheet-1',
    },
    bg: {
      type: String,
      default: 'silver',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
})

app.component('win-text', {
  template: '#win-text',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  }
})

app.component('win-group', {
  template: '#win-group',
  props: {
    title: {
      type: String,
      default: null,
    },
  }
})

app.component('win-icon', {
  template: '#win-icon',
  props: {
    name: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: '16',
    },
  }
})

app.component('win-control-strip', {
  template: '#win-control-strip',
  props: {
    border: {
      type: Boolean,
      default: true,
    },
  }
})

app.mount('#app')
