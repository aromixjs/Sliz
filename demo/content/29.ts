export default {
   name: "29 - form elements",
   expected: "valid",
   source: String.raw`<form action="/submit" method="POST">
    <fieldset>
        <legend>User Info</legend>
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required pattern="[A-Za-z]+" />
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required />
        <label for="age">Age:</label>
        <input type="number" id="age" name="age" min="0" max="150" />
    </fieldset>
    <fieldset>
        <legend>Preferences</legend>
        <select name="color" id="color">
            <option value="">Select...</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green" selected>Green</option>
        </select>
        <textarea name="bio" rows="4" cols="50" placeholder="Tell us about yourself..."></textarea>
        <input type="checkbox" id="agree" name="agree" required />
        <label for="agree">I agree to terms</label>
    </fieldset>
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
</form>`,
}
