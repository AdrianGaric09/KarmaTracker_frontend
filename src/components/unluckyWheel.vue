<template>
  <BaseWheel
    :title="title"
    :segments="wheelSegments"
    variant="unlucky"
    @wheel-result="$emit('wheel-result', $event)"
    @close="$emit('close')"
  />
</template>

<script>
import BaseWheel from '@/components/baseWheel.vue'

export default {
  name: 'UnluckyWheel',
  components: { BaseWheel },
  emits: ['wheel-result', 'close'],
  computed: {
    title() { return 'Oh no! You found a wheel of misfortune.' }
  },
  data() {
    return {
      wheelSegments: [
        { text: '-50', value: -50, special: false },
        { text: '-100', value: -100, special: false },
        { text: '-200', value: -200, special: false },
        { text: '+100', value: 100, special: false },
        { text: '-1000', value: -1000, special: true },
        { text: '+50', value: 50, special: false },
        { text: '-100', value: -100, special: false },
        { text: '-50', value: -50, special: false },
        { text: '-200', value: -200, special: false },
        { text: '+50', value: 50, special: false },
        { text: '-200', value: -200, special: false },
        { text: '-100', value: -100, special: false },
        { text: 'SPIN AGAIN', value: 'spin-again', special: true },
        { text: '+100', value: 100, special: false },
        { text: '-50', value: -50, special: false },
        { text: '+50', value: 50, special: false },
        { text: 'INSTANT KARMA', value: 'instant-karma', special: true },
        { text: '+100', value: 100, special: false }
      ]
    }
  }
}
</script>

<style scoped></style>
