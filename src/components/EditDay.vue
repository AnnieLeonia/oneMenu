<template>
  <div>
    <header>
      <h1>OneMenu</h1>
    </header>
    <h2>{{ date | moment("dddd D/M") }}</h2>
    <form>
      <section>
        <span>Day:</span>
        <el-select v-model="day" placeholder="Select day">
          <el-option v-for="day in days" :key="day.id" :value="day.name" />
        </el-select>
      </section>
      <section>
        <span>Dish:</span>
        <el-input placeholder="Write dish..." v-model="dish"></el-input>
      </section>
      <section v-for="(side, index) in sides" :key="index">
        <span>Side:</span>
        <el-select
          class="shorter"
          v-model="sides[index].sidetype"
          placeholder="Select sidetype"
        >
          <el-option
            v-for="side in sidetypes"
            :key="side.id"
            :value="side.name"
          />
        </el-select>
        <el-input
          class="short"
          placeholder="Write dessert..."
          v-model="side.side"
        />
        <span class="delete" v-on:click="deleteSide(index)">
          <v-icon class="cross" name="times" scale="2" />
        </span>
      </section>
      <button type="button" class="addSideBtn" v-on:click="addSide()">
        Add side
      </button>
      <br />
    </form>
    <button class="backBtn" v-on:click="goBack()">CANCEL</button>
    <button class="saveBtn" v-on:click="save()">SAVE</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      day: "",
      dish: "",
      sides: []
    };
  },
  computed: {
    date: function() {
      return this.$route.params.date;
    }
  },
  asyncComputed: {
    days: async function() {
      const dayId = this.$moment(this.date).isoWeekday();
      const res = await fetch("/api/days/" + dayId);
      const days = await res.json();
      return days;
    },
    sidetypes: async function() {
      const res = await fetch("/api/sidetypes");
      const sidetypes = await res.json();
      return sidetypes;
    }
  },
  methods: {
    addSide() {
      this.sides.push({ sidetype: null, name: null });
    },
    deleteSide(index) {
      this.sides.splice(index, 1);
    },
    save() {
      if (this.dish) {
        if (this.day) {
          const dayId = this.days.find(day => day.name == this.day).id;
          const sides = [];
          if (this.sides.length > 0) {
            for (var i = 0; i < this.sides.length; i++) {
              const side = this.sides[i];
              if (side.name && side.sidetype) {
                const sideId = this.sidetypes.find(s => s.name == side.sidetype)
                  .id;
                sides.push({ name: side.name, sidetypeId: sideId });
              }
            }
          }
          const dinner = {
            name: this.dish,
            date: this.date,
            dayId: dayId,
            sides: sides
          };
          console.log(dinner);
        }
      }
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    }
  },
  created: function() {
    const currentDinner = this.$store.state.currentDinner;
    this.dish = currentDinner.dish;
    this.day = currentDinner.dish ? currentDinner.day : "";
    this.sides = currentDinner.sides || [];
  }
};
</script>

<style lang="less" scoped>
h2 {
  font-size: 120%;
  margin: 0.5em;
}

form {
  padding: 0;
  margin: 0;
}

section {
  display: flex;
  margin: 0.5em;
}

span {
  margin: 0.5em 0;
  text-align: right;
  display: inline-block;
  flex: 2;
}

.el-select,
.el-input {
  flex: 8;
  margin: 0.25em 0.5em;

  &.short {
    flex: 4;
    margin: 0.25em 0.25em 0.25em 0.5em;
  }

  &.shorter {
    flex: 3;
    margin: 0.25em 0.5em 0.25em 0.25em;
  }
}

.delete {
  flex: 1;
}

.cross {
  position: relative;
  margin: 0 auto;
  display: block;
  fill: #666;
}

button {
  padding: 0.5em 1em;
  border-radius: 10px;
  font-size: 80%;

  &.addSideBtn {
    color: white;
    float: right;
    margin-right: 1em;
    background-color: #ff851b;
  }

  &.backBtn,
  &.saveBtn {
    margin: 2em 0 1em 0;
  }
}
</style>
