<template>
  <div>
    <header>
      <h1>OneMenu</h1>
    </header>
    <h2>{{ date | moment("dddd D/M") }}</h2>
    <form>
      <section>
        <span>Day:</span>
        <el-select v-model="dayId" placeholder="Select day">
          <el-option :key="0" :label="date | moment('dddd')" :value="null" />
          <el-option
            v-for="day in days"
            :key="day.id"
            :label="day.name"
            :value="day.id"
          />
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
          v-model="side.sidetypeId"
          placeholder="Select sidetype"
        >
          <el-option
            v-for="side in sidetypes"
            :key="side.id"
            :label="side.name"
            :value="side.id"
          />
        </el-select>
        <el-input
          class="short"
          placeholder="Write dessert..."
          v-model="side.name"
        />
        <span class="delete" v-on:click="deleteSide(index)">
          <v-icon class="cross" name="times" scale="2" />
        </span>
      </section>
      <div class="buttons addSide">
        <el-button class="addSideBtn " round v-on:click="addSide()">
          Add side
        </el-button>
      </div>
    </form>
    <div class="buttons">
      <el-button type="danger" plain round v-on:click="remove()">
        Delete
      </el-button>
      <el-button type="warning" plain round v-on:click="goBack()">
        Cancel
      </el-button>
      <el-button type="success" plain round v-on:click="save()">
        Save
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dayId: null,
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
      this.sides.push({ name: null, sidetypeId: null });
    },
    deleteSide(index) {
      this.sides.splice(index, 1);
    },
    async save() {
      if (this.dish) {
        const dinner = {
          name: this.dish,
          date: this.date,
          dayId: this.dayId,
          sides: this.sides.filter(({ name, sidetypeId }) => name && sidetypeId)
        };
        console.log("Dinner: ", dinner);

        const res = await fetch("/api/dishes", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(dinner)
        });
        const response = await res.json();
        console.log("Save: ", response);

        this.goBack();
      }
    },
    async remove() {
      const res = await fetch("/api/dishes/" + this.date, { method: "DELETE" });
      //const response = await res.json();
      //console.log("response", response);
      this.goBack();
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push("/");
    }
  },
  created: async function() {
    const res = await fetch("/api/dishes/" + this.date);
    const response = await res.json();
    console.log("RES", response);

    this.dish = response.name || "";
    this.dayId = response.dayId || null;
    this.sides = response.sides || [];
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

.buttons {
  display: flex;
  margin: 1em;
}

.el-button {
  flex: 1;

  &.addSideBtn {
    color: white;
    background-color: #cd5c5c;
  }
}
</style>
