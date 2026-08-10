export default {
  name: "27 - extremely long source",
  expected: "stress",
  source: String.raw`<script server lang="ts">
const a1 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const a2 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const a3 = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";
const a4 = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
const a5 = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
</script>

<style>
.class1 { color: red; }
.class2 { color: blue; }
.class3 { color: green; }
.class4 { color: yellow; }
.class5 { color: purple; }
.class6 { color: orange; }
.class7 { color: pink; }
.class8 { color: brown; }
.class9 { color: gray; }
.class10 { color: black; }
</style>

<div>
    <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
    <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
    <span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
    <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
    <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span>
    <span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
</div>`,
};
