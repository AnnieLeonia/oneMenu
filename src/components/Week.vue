<template>
  <main>
    <span class="icon left" v-on:click="back()">
      <v-icon name="chevron-left" scale="2" />
    </span>
    <span class="icon right" v-on:click="next()">
      <v-icon name="chevron-right" scale="2" />
    </span>
    <p class="year">{{ date | moment("YYYY") }}</p>
    <h1>{{ date | moment("W") }}</h1>
    <ul :v-model="week">
      <li v-for="day in week" v-bind:key="day.id">
        <p v-bind:class="isToday(day.date) ? 'today' : ''">
          {{ day.date | moment("dddd D/M") }}
        </p>
      </li>
    </ul>
  </main>
</template>

<script>
export default {
  data() {
    return {
      date: this.$moment()
    };
  },
  computed: {
    week: function() {
      const weekdays = [];
      for (var i = 1; i < 6; i += 1) {
        weekdays.push({ id: i, date: this.$moment(this.date).day(i) });
      }
      return weekdays;
    }
  },
  methods: {
    isToday(day) {
      const f = "dddd, MMMM Do YYYY";
      return day.format(f) == this.$moment().format(f);
    },
    next: function() {
      this.date = this.$moment(this.date).add(7, "days");
    },
    back: function() {
      this.date = this.$moment(this.date).subtract(7, "days");
    }
  },
  created: function() {}
};
</script>

<style lang="less">
h1 {
  margin: 0.2em;
}

p {
  &.year {
    margin: 0;
    font-size: 80%;
  }

  &.today {
    font-weight: bold;
  }
}

.icon {
  margin: 0.5em;
  position: absolute;
  top: calc(50% - 2em);

  &.left {
    left: 0;
  }
  &.right {
    right: 0;
  }
}

ul {
  list-style-type: none;
  margin: 0 auto;
  padding: 0;
  width: 75%;
}

li {
  text-align: left;
}
</style>

