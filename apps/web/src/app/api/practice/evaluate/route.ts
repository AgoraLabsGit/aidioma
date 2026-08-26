/**
 * The former client-directed prototype grader is intentionally retired. Grading now happens only
 * inside the authenticated, revision-checked Practice session command so an answer and its learner
 * evidence are committed together.
 */
export async function POST(): Promise<Response> {
  return Response.json(
    {
      error: "session_command_required",
      message: "Submit answers through the active Practice session.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
