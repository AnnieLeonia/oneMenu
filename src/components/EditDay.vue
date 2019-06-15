<template>
  <main>
    <h1>{{ date | moment("dddd D/M") }}</h1>
    <form v-on:submit="checkForm()">
      <section>
        <label>Day:</label>
        <select class="full" v-model="day">
          <option v-for="day in days" :key="day.id">
            {{ day.name }}
          </option>
        </select>
      </section>
      <section>
        <label>Dish:</label>
        <input class="full" type="text" v-model="dish" required="" />
      </section>
      <div v-for="(side, index) in sides" :key="index">
        <section>
          <label>Side:</label>
          <select class="half" v-model="sides[index].sideType">
            <option v-for="side in sidetypes" :key="side.id">
              {{ side.name }}
            </option>
          </select>
          <input class="half" type="text" v-model="side.side" />
          <span class="cross" v-on:click="deleteSide(index)">
            <v-icon name="times" scale="1.2" />
          </span>
        </section>
      </div>
      <button type="button" class="addSideBtn" v-on:click="addSide()">
        Add side
      </button>
      <br />
      <button class="backBtn" v-on:click="goBack()">CANCEL</button>
      <button class="saveBtn" type="submit" v-on:click="save()">SAVE</button>
    </form>
  </main>
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
      const dayId = this.$moment(this.date).format("e");
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
      this.sides.push({ sideType: null, side: null });
    },
    deleteSide(index) {
      this.sides.splice(index, 1);
    },
    checkForm() {
      if (this.day == "") {
        console.log("missing day");
      }
      if (this.dish == "") {
        console.log("missing dish");
      }
      if (this.sides.length == 0) {
        console.log("no sides");
      }
    },
    save() {
      this.checkForm();
      console.log("done");
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    }
  }
};
</script>

<style lang="less" scoped>
h1 {
  font-size: 120%;
  margin: 0.5em;
}

form {
  margin: 0 auto;
  padding: 0 1em;
}

input:required:focus {
  border: 1px solid red;
  outline: none;
}

section {
  text-align: left;
}

label {
  text-align: right;
  display: inline-block;
  width: 20%;
}

input[type="text"],
select {
  border: 1px solid black;

  &.full {
    width: 60%;
  }

  &.half {
    width: calc(30% - 5px);
  }
}

.cross {
  position: relative;
  top: 6px;
}

button {
  padding: 0.5em 1em;
  border-radius: 10px;
  font-size: 80%;

  &.addSideBtn {
    color: #333;
  }

  &.backBtn {
    margin: 2em 0 1em 0;
  }
}
</style>
