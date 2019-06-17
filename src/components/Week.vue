<template>
  <div>
    <header>
      <h1>OneMenu</h1>
      <button class="logout" v-on:click="logout()">
        <v-icon name="sign-out-alt" />
      </button>
    </header>
    <span class="icon left" v-on:click="back()">
      <v-icon class="arrow" name="chevron-left" scale="2" />
    </span>
    <span class="icon right" v-on:click="next()">
      <v-icon class="arrow" name="chevron-right" scale="2" />
    </span>
    <div class="top">
      <p class="top right">Weekly</p>
      <h2>{{ date | moment("W") }}</h2>
      <p class="top left">Menu</p>
    </div>
    <p class="year">{{ date | moment("YYYY") }}</p>
    <ul class="week" :v-model="week">
      <li v-for="day in week" v-bind:key="day.id">
        <p v-bind:class="isToday(day.date) ? 'day today' : 'day'">
          {{ day.day }} {{ day.date | moment("D/M") }}
          <span v-if="editable" class="edit" v-on:click="editDish(day)">
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
  </div>
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
      const monday = current.isoWeekday(1).format("YYYY-MM-DD");
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
            day = dishes[j].day || day;
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
    editDish(day) {
      const dinner = this.week[day.id - 1];
      this.$store.commit("setCurrentDinner", dinner);
      const date = day.date.format("YYYY-MM-DD");
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
header {
  background-color: #ff851b;
  text-align: left;
  color: #662f00;
  height: 3em;
}

h2 {
  margin: 0.2em;
  font-family: fantasy;
  flex: 1;
}

.top {
  display: flex;
}

p {
  margin: 0;

  &.year {
    font-size: 80%;
    margin: 0;
    font-family: cursive;
  }

  &.today {
    font-weight: bold;
  }

  &.day {
    margin: 1em 0 0 0;
  }

  &.top {
    flex: 3;
    display: inline;
    font-family: fantasy;
    font-size: 200%;
    color: #eee;
    font-style: italic;

    &.left {
      text-align: left;
    }

    &.right {
      text-align: right;
    }
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

&.arrow {
  fill: #ff851b;
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
  background-color: #fff8;
  border: solid #666 2px;
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