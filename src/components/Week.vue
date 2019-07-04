<template>
  <div>
    <header>
      <h1 style="flex: 1">OneMenu</h1>
      <button class="logout" v-on:click="logout()">
        <v-icon style="margin-left: 3px" name="sign-out-alt" />
      </button>
    </header>
    <span class="icon left" v-on:click="back()">
      <v-icon class="arrow" name="chevron-left" scale="2" />
    </span>
    <span class="icon right" v-on:click="next()">
      <v-icon class="arrow" name="chevron-right" scale="2" />
    </span>
    <div class="top right">
      <p class="right">Weekly</p>
    </div>
    <div class="top center">
      <div>
        <p class="weeknbr">{{ date | moment("W") }}</p>
        <p class="year">{{ date | moment("YYYY") }}</p>
      </div>
    </div>
    <div class="top left">
      <p class="left">Menu</p>
    </div>
    <ul class="week" :v-model="week">
      <li
        :class="editable ? 'day editable' : 'day'"
        v-for="day in week"
        v-bind:key="day.id"
      >
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
    <el-button
      :class="editable ? 'editBtn on' : 'editBtn off'"
      round
      v-on:click="toggleEdit()"
    >
      {{ editText }}
    </el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    editable: function() {
      return this.$store.state.editable;
    },
    date: function() {
      return this.$store.state.currentWeek;
    }
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
      this.$store.commit("setEditable", !this.editable);
    },
    editDish(day) {
      this.$router.push("/edit/" + day.date.format("YYYY-MM-DD"));
    },
    next() {
      this.$store.commit("nextWeek", this.$moment(this.date));
    },
    back() {
      this.$store.commit("backWeek", this.$moment(this.date));
    },
    logout() {
      location.href = "/auth/logout";
    }
  },
  created: function() {
    this.$store.commit("setWeek", this.$moment());
  }
};
</script>

<style lang="less">
header {
  display: flex;
  background-color: #cd5c5c;
  text-align: left;
  color: white;
  height: 3em;
}

.top {
  display: inline-table;
  table-layout: fixed;
  margin: 0 auto;
  width: 40%;

  &.center {
    width: 20%;
  }
}

.top > p,
.top > div {
  display: table-cell;
  vertical-align: middle;
  margin: 0;
}

p {
  margin: 0;

  &.weeknbr {
    font-family: fantasy;
    font-size: 175%;
  }

  &.year {
    font-size: 80%;
    margin: 0;
    font-family: cursive;
  }

  &.left,
  &.right {
    font-family: fantasy;
    font-size: 200%;
    color: #eee;
    font-style: italic;
  }

  &.left {
    text-align: left;
  }

  &.right {
    text-align: right;
  }

  &.day {
    font-size: 120%;
  }

  &.today {
    font-weight: bold;
  }

  &.top {
    flex: 3;
    display: inline;
    font-family: fantasy;
    font-size: 200%;
    color: #eee;
    font-style: italic;
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
  fill: #cd5c5c;
}

.edit {
  position: absolute;
  cursor: pointer;
  right: 15%;
}

.editBtn {
  margin: 1em;
  font-size: 80%;
  width: 50%;
  max-width: 300px;

  &.on {
    color: #cd5c5c;
    border: solid #cd5c5c 2px;
  }

  &.off {
    background-color: #cd5c5c;
    color: white;
  }
}

.logout {
  width: 2.5em;
  height: 2.5em;
  font-size: inherit;
  background-color: #fff8;
  border: solid #666 2px;
  margin: 0.25em;
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

  &.day {
    padding: 0.5em;
    border: solid transparent;
    border-width: 2px 2px 0px 2px;
  }

  &.day:last-child {
    border-width: 2px;
  }

  &.editable {
    border: dashed black;
    border-width: 2px 2px 0px 2px;
  }

  &.editable:last-child {
    border-width: 2px;
  }
}
</style>