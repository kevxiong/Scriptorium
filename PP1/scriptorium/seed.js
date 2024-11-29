const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

// Define programming languages and their sample code snippets
const codeSnippets = [
  {
    language: 'JavaScript',
    code: `function greet(name) {\n  return 'Hello, ' + name + '!';\n}\nconsole.log(greet('World'));`,
  },
  {
    language: 'Python',
    code: `def greet(name):\n    return f"Hello, {name}!"\nprint(greet("World"))`,
  },
  {
    language: 'Java',
    code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
  },
  {
    language: 'C++',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  },
  {
    language: 'Ruby',
    code: `def greet(name)\n  "Hello, #{name}!"\nend\nputs greet("World")`,
  },
  {
    language: 'Go',
    code: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
  },
  {
    language: 'PHP',
    code: `<?php\nfunction greet($name) {\n    return "Hello, $name!";\n}\necho greet("World");\n?>`,
  },
  {
    language: 'C#',
    code: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
  },
  {
    language: 'Swift',
    code: `func greet(name: String) -> String {\n    return "Hello, \\(name)!"\n}\nprint(greet(name: "World"))`,
  },
  {
    language: 'Kotlin',
    code: `fun greet(name: String): String {\n    return "Hello, $name!"\n}\nprintln(greet("World"))`,
  },
];

async function main() {
  try {
    console.log('Seeding database...');

    // Create 30 Users
    const users = [];
    for (let i = 0; i < 30; i++) {
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          avatar: faker.image.avatar(),
          phone: faker.phone.number(),
          isAdmin: faker.datatype.boolean(),
        },
      });
      users.push(user);
    }
    console.log('Users created:', users.length);

    // Create 30 Posts
    const posts = [];
    for (let i = 0; i < 30; i++) {
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          userId: faker.helpers.arrayElement(users).id,
        },
      });
      posts.push(post);
    }
    console.log('Posts created:', posts.length);

    // Create 30 Templates with code snippets
    const templates = [];
    for (let i = 0; i < 30; i++) {
      const snippet = faker.helpers.arrayElement(codeSnippets);
      const template = await prisma.template.create({
        data: {
          title: `${snippet.language} Code Snippet`,
          code: snippet.code,
          explanation: faker.lorem.sentence(),
          userId: faker.helpers.arrayElement(users).id,
        },
      });
      templates.push(template);
    }
    console.log('Templates created:', templates.length);

    // Create 30 Comments
    const comments = [];
    for (let i = 0; i < 30; i++) {
      const comment = await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          postId: faker.helpers.arrayElement(posts).id,
          userId: faker.helpers.arrayElement(users).id,
          parentId: null,
        },
      });
      comments.push(comment);
    }
    console.log('Comments created:', comments.length);

    // Create 30 Unique Tags
    const tags = [];
    while (tags.length < 30) {
      const name = faker.lorem.word();
      const existingTag = await prisma.tag.findUnique({ where: { name } });
      if (!existingTag) {
        const tag = await prisma.tag.create({ data: { name } });
        tags.push(tag);
      }
    }
    console.log('Tags created:', tags.length);

    // Associate Tags with Posts and Templates
    for (const post of posts) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          tags: {
            connect: faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 5 })).map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });
    }

    for (const template of templates) {
      await prisma.template.update({
        where: { id: template.id },
        data: {
          tags: {
            connect: faker.helpers.arrayElements(tags, faker.number.int({ min: 1, max: 5 })).map((tag) => ({
              id: tag.id,
            })),
          },
        },
      });
    }
    console.log('Tags associated with posts and templates.');

    // Create 30 Ratings
    const ratings = [];
    for (let i = 0; i < 30; i++) {
      const rating = await prisma.rating.create({
        data: {
          upvote: faker.datatype.boolean(),
          downvote: !faker.datatype.boolean(),
          userId: faker.helpers.arrayElement(users).id,
          postId: faker.helpers.arrayElement(posts).id,
        },
      });
      ratings.push(rating);
    }
    console.log('Ratings created:', ratings.length);

    // Create 30 Reports
    const reports = [];
    for (let i = 0; i < 30; i++) {
      const report = await prisma.report.create({
        data: {
          reason: faker.lorem.sentence(),
          userId: faker.helpers.arrayElement(users).id,
          postId: faker.datatype.boolean() ? faker.helpers.arrayElement(posts).id : null,
          commentId: faker.datatype.boolean() ? faker.helpers.arrayElement(comments).id : null,
        },
      });
      reports.push(report);
    }
    console.log('Reports created:', reports.length);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
