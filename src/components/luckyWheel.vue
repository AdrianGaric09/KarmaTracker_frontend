<template>
  <BaseWheel
    :title="title"
    :segments="wheelSegments"
    variant="lucky"
    @wheel-result="$emit('wheel-result', $event)"
    @close="$emit('close')"
  />
</template>

<script>
import BaseWheel from '@/components/baseWheel.vue'

export default {
  name: 'LuckyWheel',
  components: { BaseWheel },
  emits: ['wheel-result', 'close'],
  computed: {
    title() { return 'Nice! You found a lucky wheel.' }
  },
  data() {
    return {
      wheelSegments: [
        { text: '+50', value: 50, special: false },
        { text: '+100', value: 100, special: false },
        { text: '+200', value: 200, special: false },
        { text: '-100', value: -100, special: false },
        { text: '+1000', value: 1000, special: true },
        { text: '-50', value: -50, special: false },
        { text: '+100', value: 100, special: false },
        { text: '+50', value: 50, special: false },
        { text: '+200', value: 200, special: false },
        { text: '-50', value: -50, special: false },
        { text: '+200', value: 200, special: false },
        { text: '+100', value: 100, special: false },
        { text: 'NO KARMA', value: 'no-karma', special: true },
        { text: '-100', value: -100, special: false },
        { text: '+50', value: 50, special: false },
        { text: '-50', value: -50, special: false },
        { text: 'CROWN', value: 'crown', special: true },
        { text: '-100', value: -100, special: false }
      ]
    }
  }
}
</script>
<style scoped></style>
