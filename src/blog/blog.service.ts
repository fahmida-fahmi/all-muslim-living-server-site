import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogService {
  private readonly blogs = [
    {
      id: 1,
      title: 'First Blog',
      content: 'This is the content of the first blog.',
      uniqueField: 'uniqueValue1',
    },
    {
      id: 2,
      title: 'Second Blog',
      content: 'This is the content of the second blog.',
      uniqueField: 'uniqueValue2',
    },
  ];

  findAll() {
    return this.blogs;
  }
  findOne(id: number) {
    return this.blogs.find((blog) => blog.id === id);
  }
  findByUniqueField(key: string) {
    return this.blogs.find((blog) => blog.uniqueField === key);
  }
}
