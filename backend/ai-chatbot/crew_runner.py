from crewai import Crew

def run_property_crew(agent, task):
    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=False,
    )

    result = crew.kickoff()
    return result
