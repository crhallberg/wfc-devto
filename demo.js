const word = new WFC();

// callback when done
word.done(space => {
  document.getElementById("output").innerHTML = space.join("");
});

// Add modules
word.addModule("A", { left: [word.EDGE], right: ["B", "C"] }); // Constant for edges
word.addModule("B", { left: ["A", "C"], right: ["A", "C"] });
word.addModule("C", { left: ["A", "B"], right: [word.EDGE] });

// Kick off with a space
word.defineSpace(3);

//

const waltz = new WFC();

// callback when done
waltz.done(console.log.bind(console));

// Add modules
waltz.addModule("one", { left: [word.EDGE, "three"], right: [word.EDGE, "two"] });
waltz.addModule("two", { left: [word.EDGE, "one"], right: [word.EDGE, "three"] });
waltz.addModule("three", { left: [word.EDGE, "two"], right: [word.EDGE, "one"] });

// Kick off with a space
waltz.defineSpace(14);
waltz.space[0].resolve("one");