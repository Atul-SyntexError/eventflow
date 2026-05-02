package com.eventflow.controller;

import com.eventflow.dto.TaskDetailDto;
import com.eventflow.service.OrganizerTaskService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonPayloadMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/organizer/tasks", "/organizer/tasks/*"})
public final class OrganizerTasksPageController extends HttpServlet {

  private static final Pattern EDIT_PATH_PATTERN = Pattern.compile("^/([0-9]+)/edit/?$");
  private static final String VIEW_PATH = "/WEB-INF/views/organizer/tasks.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String pathInfo = request.getPathInfo();
    String initialMode = "list";
    String selectedTaskId = null;

    if (pathInfo == null || "/".equals(pathInfo)) {
      initialMode = "list";
    } else if ("/new".equals(pathInfo) || "/new/".equals(pathInfo)) {
      initialMode = "create";
    } else {
      Matcher matcher = EDIT_PATH_PATTERN.matcher(pathInfo);
      if (!matcher.matches()) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      initialMode = "edit";
      selectedTaskId = matcher.group(1);
    }

    OrganizerTaskService organizerTaskService = AppComponentFactory.organizerTaskService(getServletContext());
    JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
    OrganizerTaskService.TaskBootstrapData bootstrapData = organizerTaskService.buildBootstrapData();

    request.setAttribute("taskInitialMode", initialMode);
    request.setAttribute("taskSelectedId", selectedTaskId);
    request.setAttribute("organizerTaskManagementBootstrapJson", jsonPayloadMapper.write(toBootstrapDataset(bootstrapData)));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }

  private Map<String, Object> toBootstrapDataset(OrganizerTaskService.TaskBootstrapData bootstrapData) {
    Map<String, Object> dataset = new LinkedHashMap<>();
    dataset.put("summary", bootstrapData.summary());
    dataset.put("filterOptions", bootstrapData.filterOptions());
    dataset.put("tasks", bootstrapData.tasks());
    dataset.put("details", bootstrapData.details().stream().map(this::toBootstrapDetail).toList());
    dataset.put("suggestionGroups", bootstrapData.suggestionGroups());
    dataset.put("eventOptions", bootstrapData.eventOptions());
    dataset.put("skillCatalog", bootstrapData.skillCatalog());
    dataset.put("createTemplate", bootstrapData.createTemplate());
    return dataset;
  }

  private Map<String, Object> toBootstrapDetail(OrganizerTaskService.TaskEditorState editorState) {
    TaskDetailDto detail = editorState.detail();
    Map<String, Object> detailMap = new LinkedHashMap<>();
    detailMap.put("taskId", detail.taskId());
    detailMap.put("eventId", detail.eventId());
    detailMap.put("title", detail.title());
    detailMap.put("description", detail.description());
    detailMap.put("priority", detail.priority());
    detailMap.put("status", detail.status());
    detailMap.put("requiredSkills", detail.requiredSkills());
    detailMap.put("dependencies", detail.dependencies());
    detailMap.put("dependencyTaskIds", editorState.dependencyTaskIds());
    detailMap.put("assignedVolunteer", detail.assignedVolunteer());
    detailMap.put("deadlineAt", detail.deadlineAt());
    detailMap.put("requiredStartAt", editorState.requiredStartAt());
    detailMap.put("activityFeed", detail.activityFeed());
    return detailMap;
  }
}