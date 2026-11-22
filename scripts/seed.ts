import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Tweet, Notification, Conversation, Message } from "../src/lib/models";
import { generateAvatar, generateBanner } from "../src/lib/utils";

const URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xclone";

const usersData = [
  { name: "Alex Rivera", username: "alexrivera", bio: "Building things for the web. Designer, developer, perpetual tinkerer. ✳️", verified: true, location: "San Francisco, CA" },
  { name: "Priya Sharma", username: "priyacodes", bio: "Software engineer @ OpenAI-ish. I write about TypeScript, systems & coffee. ☕", verified: true, location: "Bengaluru, India" },
  { name: "Marcus Chen", username: "marcusbuilds", bio: "Founder @ Daybreak. Previously @ Vercel. Shipping small, shipping often.", verified: false, location: "New York, NY" },
  { name: "Sarah Kim", username: "sarahkim", bio: "Product designer. Making pixels behave. Portfolio link below ↓", verified: true, location: "Seoul, South Korea" },
  { name: "Dev Patel", username: "devpatel", bio: "Open source maintainer. Rust, Go, and a little bit of everything.", verified: false, location: "London, UK" },
  { name: "Nina Okafor", username: "ninaokafor", bio: "Writing about AI, startups and the future of work. Ex-journalist.", verified: false, location: "Lagos, Nigeria" },
  { name: "Theo Martin", username: "theomartin", bio: "Front-end engineer. Tailwind enthusiast. Dark mode activist.", verified: false, location: "Paris, France" },
  { name: "Aisha Rahman", username: "aisharahman", bio: "Data scientist by day, photographer by night. 📷", verified: true, location: "Dubai, UAE" },
];

const tweetsData: { user: string; text: string; images?: string[]; likes: number; rts: number }[] = [
  { user: "alexrivera", text: "we just shipped the new design system. 6 months of work, 400+ components, one very tired team. worth it. 🚀", images: ["https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80"], likes: 1240, rts: 180 },
  { user: "priyacodes", text: "hot take: most \"performance problems\" are just unoptimized images and too much JavaScript. start there.", likes: 892, rts: 143 },
  { user: "marcusbuilds", text: "Day 42 of building in public:\n\n– 1,247 signups\n– 312 paying customers\n– 0 sleep\n\nThe graph is going up and to the right. Back to the code.", likes: 2103, rts: 421 },
  { user: "sarahkim", text: "good design is invisible. great design makes you feel something before you understand why.", images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80"], likes: 3420, rts: 890 },
  { user: "devpatel", text: "just merged a 14k line PR that deletes 22k lines of code. best kind of PR.", likes: 1567, rts: 302 },
  { user: "ninaokafor", text: "the AI conversation in 2026 has shifted from \"what can it do?\" to \"who gets to control it?\" and that changes everything.", likes: 734, rts: 128 },
  { user: "theomartin", text: "dark mode isn't a feature. it's a lifestyle. 🌙", likes: 445, rts: 61 },
  { user: "aisharahman", text: "took this shot at 5am in the desert. no edits, just patience and a lot of cold fingers. 📷", images: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80"], likes: 5621, rts: 1432 },
  { user: "alexrivera", text: "reminder: your side project doesn't need to be a startup. sometimes it's just a thing you made because you wanted to see if you could. that's enough.", likes: 4832, rts: 1204 },
  { user: "priyacodes", text: "TypeScript tip: `satisfies` is the keyword you probably want instead of `as`. It validates without widening the type.", likes: 1129, rts: 287 },
  { user: "marcusbuilds", text: "the best product advice I ever got: talk to users before you write code. the second best: then actually listen.", likes: 876, rts: 94 },
  { user: "sarahkim", text: "white space is not empty space. it's breathing room for your content.", likes: 1934, rts: 388 },
  { user: "devpatel", text: "why does every codebase have a file named `utils.ts` that eventually becomes 3000 lines of pure chaos", likes: 2781, rts: 612 },
  { user: "ninaokafor", text: "the creator economy is just the middle class discovering what freelancers have known for decades: you are the product, the platform, and the customer.", likes: 1432, rts: 254 },
  { user: "theomartin", text: "Tailwind CSS finally clicked for me when I stopped thinking in classes and started thinking in constraints.", likes: 643, rts: 88 },
  { user: "aisharahman", text: "data tells you what happened. stories tell you why it mattered. you need both.", likes: 998, rts: 176 },
  { user: "alexrivera", text: "building an X clone this weekend with Next.js + MongoDB. turns out the hard part isn't the code, it's getting the hover states exactly right.", likes: 321, rts: 42 },
  { user: "priyacodes", text: "MongoDB + Next.js App Router is such a clean stack for MVPs. schemas when you want them, flexibility when you don't.", likes: 567, rts: 73 },
  { user: "devpatel", text: "nothing humbles you faster than reading code you wrote 6 months ago with absolute confidence.", likes: 3450, rts: 799 },
  { user: "sarahkim", text: "the little details: a 150ms transition, a subtle border, the right shade of gray. they add up to trust.", likes: 1204, rts: 231 },
];

async function main() {
  await mongoose.connect(URI, { dbName: "xclone" });
  console.log("Connected to MongoDB, seeding...");

  await Promise.all([
    User.deleteMany({}),
    Tweet.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);
  const userMap = new Map<string, mongoose.Types.ObjectId>();

  const demo = await User.create({
    name: "Demo User",
    username: "demo",
    email: "demo@x.com",
    password: passwordHash,
    bio: "Just here exploring. Building things on the internet. ✨",
    location: "Earth",
    website: "https://x.com",
    avatar: generateAvatar("demo"),
    banner: generateBanner("demo"),
    verified: false,
  });
  userMap.set("demo", demo._id as mongoose.Types.ObjectId);

  for (const data of usersData) {
    const user = await User.create({
      ...data,
      email: `${data.username}@example.com`,
      password: passwordHash,
      avatar: generateAvatar(data.username),
      banner: generateBanner(data.username),
    });
    userMap.set(data.username, user._id as mongoose.Types.ObjectId);
  }

  const allUsers = await User.find().lean();
  const allIds = allUsers.map((u) => u._id);
  const demoId = userMap.get("demo")!;

  const following = new Map<string, mongoose.Types.ObjectId[]>();
  const followers = new Map<string, mongoose.Types.ObjectId[]>();
  for (const user of allUsers) {
    following.set(String(user._id), []);
    followers.set(String(user._id), []);
  }
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = 0; j < allUsers.length; j++) {
      if (i === j) continue;
      const a = String(allUsers[i]._id);
      const b = String(allUsers[j]._id);
      if (Math.random() < 0.38) {
        following.get(a)!.push(allUsers[j]._id as mongoose.Types.ObjectId);
        followers.get(b)!.push(allUsers[i]._id as mongoose.Types.ObjectId);
      }
    }
  }
  await Promise.all(
    allUsers.map((user) => {
      const id = String(user._id);
      return User.findByIdAndUpdate(id, {
        following: following.get(id),
        followers: followers.get(id),
      });
    }),
  );

  const tweetIds: mongoose.Types.ObjectId[] = [];
  for (const [index, data] of tweetsData.entries()) {
    const authorId = userMap.get(data.user)!;
    const likers = allIds.filter((id) => !id.equals(authorId)).sort(() => Math.random() - 0.5).slice(0, Math.min(data.likes, 8));
    const retweeters = allIds.filter((id) => !id.equals(authorId)).sort(() => Math.random() - 0.5).slice(0, Math.min(data.rts, 5));
    const tweet = await Tweet.create({
      author: authorId,
      text: data.text,
      images: data.images || [],
      parent: null,
      mentions: [],
      likes: likers,
      retweets: retweeters,
      views: 500 + index * 137,
      createdAt: new Date(Date.now() - (index * 3 + 1) * 60 * 60 * 1000 - index * 137000),
    });
    tweetIds.push(tweet._id as mongoose.Types.ObjectId);

    for (const liker of likers.slice(0, 3)) {
      await Notification.create({ recipient: authorId, actor: liker, type: "like", tweet: tweet._id });
    }
    for (const rt of retweeters.slice(0, 2)) {
      await Notification.create({ recipient: authorId, actor: rt, type: "retweet", tweet: tweet._id });
    }
  }

  await Notification.create({ recipient: demoId, actor: userMap.get("alexrivera")!, type: "follow" });
  await Notification.create({ recipient: demoId, actor: userMap.get("priyacodes")!, type: "like", tweet: tweetIds[0] });
  await Notification.create({ recipient: demoId, actor: userMap.get("marcusbuilds")!, type: "retweet", tweet: tweetIds[2] });

  const followBack = userMap.get("sarahkim")!;
  const convo = await Conversation.create({ participants: [demoId, followBack] });
  await Message.create({ conversation: convo._id, sender: followBack, text: "Hey! Loved your posts about building on the web 👋", readBy: [followBack], createdAt: new Date(Date.now() - 7200000) });
  await Message.create({ conversation: convo._id, sender: demoId, text: "Thank you! Just getting started here.", readBy: [demoId], createdAt: new Date(Date.now() - 7000000) });
  await Message.create({ conversation: convo._id, sender: followBack, text: "Let me know if you ever want to collaborate on something.", readBy: [followBack], createdAt: new Date(Date.now() - 3600000) });

  await User.findByIdAndUpdate(demoId, { bookmarks: [tweetIds[0], tweetIds[8]] });

  console.log(`Seeded ${allUsers.length} users and ${tweetIds.length} tweets.`);
  console.log("Demo login: demo@x.com / password123");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
