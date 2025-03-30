import { NextResponse } from "next/server";
import { connectToTiDB } from "@/lib/tidb";
import { Todo } from "@/type/todo";

export async function GET() {
  try {
    const db = await connectToTiDB();
    const [rows] = await db.execute("SELECT * FROM todos");
    // 确保返回数组，即使 rows 为空
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching todos:", error);
    // 在错误情况下也返回空数组，并附带错误信息
    return NextResponse.json(
      { error: "Failed to fetch todos", data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const db = await connectToTiDB();
    const [result] = await db.execute("INSERT INTO todos (title) VALUES (?)", [
      title,
    ]);
    const newTodo: Todo = {
      id: (result as any).insertId,
      title,
      completed: false,
    };
    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, completed } = await request.json();
    const db = await connectToTiDB();
    await db.execute("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [
      title,
      completed,
      params.id,
    ]);
    return NextResponse.json({ id: Number(params.id), title, completed });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await connectToTiDB();
    const id = Number(params.id);
    console.log('Attempting to delete todo with id:', id);
    const [result] = await db.execute('DELETE FROM todos WHERE id = ?', [id]);
    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    console.log('Deleted todo, affected rows:', affectedRows);
    return NextResponse.json({ message: 'Todo deleted' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}