<template>
  <main>
    <span class="icon left" v-on:click="back()">
      <v-icon name="chevron-left" scale="2" />
    </span>
    <span class="icon right" v-on:click="next()">
      <v-icon name="chevron-right" scale="2" />
    </span>
    <button class="logout" v-on:click="logout()">
      <v-icon name="sign-out-alt" />
    </button>
    <p class="year">{{ date | moment("YYYY") }}</p>
    <h1>{{ date | moment("W") }}</h1>
    <ul class="week" :v-model="week">
      <li v-for="day in week" v-bind:key="day.id">
        <p v-bind:class="isToday(day.date) ? 'day today' : 'day'">
          {{ day.day }} {{ day.date | moment("D/M") }}
          <span v-if="editable" class="edit" v-on:click="editDish(day.date)">
            <v-icon name="pen" scale="1" />
          </span>
        </p>
        <p class="dish">{{ day.dish }}</p>
        <ul class="sides">
          <li v-for="side in day.sides" v-bind:key="side.sideType">
            <p class="side">{{ side.sidetype }}: {{ side.side }}</p>
          </li>
        </ul>
      </li>
    </ul>
    <button class="editBtn" v-on:click="toggleEdit()">
      {{ editText }}
    </button>
  </main>
</template>

<script>
export default {
  data() {
    return {
      date: this.$moment(),
      editable: false
    };
  },
  asyncComputed: {
    week: async function() {
      const weekdays = [];
      const current = this.$moment(this.date);
      const monday = current.day(1).format("YYYY-MM-DD");
      const dishes = await this.getDishes(monday);
      for (var i = 1; i < 6; i += 1) {
        var date = this.$moment(current).day(i);
        var day = date.format("dddd");
        var dish = "";
        var sides = [];
        for (var j = 0; j < dishes.length; j++) {
          if (current.day(i).format("YYYY-MM-DD") == dishes[j].date) {
            dish = dishes[j].dish;
            sides = dishes[j].sides;
            day = dishes[j].day;
          }
        }
        weekdays.push({
          id: i,
          date: date,
          day: day,
          dish: dish,
          sides: sides
        });
      }
      return weekdays;
    },
    editText() {
      if (!this.editable) {
        return "Edit menu";
      }
      return "Done editing";
    }
  },
  methods: {
    getDishes: async function(monday) {
      const res = await fetch("/api/menus/" + monday);
      const dishes = await res.json();
      return dishes;
    },
    isToday(day) {
      const f = "dddd, MMMM Do YYYY";
      return day.format(f) == this.$moment().format(f);
    },
    toggleEdit() {
      this.editable = !this.editable;
    },
    editDish(moment) {
      const date = moment.format("YYYY-MM-DD");
      console.log(this.week);

      this.$router.push("/edit/" + date);
    },
    next() {
      this.date = this.$moment(this.date).add(7, "days");
    },
    back() {
      this.date = this.$moment(this.date).subtract(7, "days");
    },
    logout() {
      location.href = "/auth/logout";
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
  margin: 0;

  &.year {
    font-size: 80%;
  }

  &.today {
    font-weight: bold;
  }

  &.day {
    margin: 1em 0 0 0;
  }

  &.dish,
  &.side {
    color: #888;
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

.edit {
  position: absolute;
  right: 2em;
}

.editBtn {
  margin: 2em 0 1em 0;
  padding: 0.5em 1em;
  border-radius: 10px;
  font-size: 80%;
}

.logout {
  position: absolute;
  right: 0;
  margin: 1em;
  padding: 0.5em 1em;
  border-radius: 10px;
}

ul {
  list-style-type: none;
  margin: 0 auto;
  padding: 0;

  &.week {
    width: 75%;
  }

  &.sides {
    margin: 0;
  }
}

li {
  text-align: center;
}
</style>